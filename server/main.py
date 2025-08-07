import eventlet.wsgi
import socketio
import eventlet
from flask import Flask, request, jsonify
from flask_cors import CORS
import party_handler as ph
from utils import generate_random_party_id


sio = socketio.Server(cors_allowed_origins='*')
app = Flask(__name__)
app.wsgi_app = socketio.WSGIApp(sio, app.wsgi_app)
CORS(app)

rooms = {}
clients_map = {}

@sio.event
def connect(sid, environ):
    print(f'Client connected: {sid}')
    sio.emit('welcome', {'content': 'I am always here for you'}, to=sid)

@sio.event
def disconnect(sid):
    print(f'Client disconnected: {sid}')

@sio.event
def create_party(sid):
    new_party_id = generate_random_party_id()
    if new_party_id in rooms:
        return {'error': f'Party {new_party_id} already exists!'}
    rooms[new_party_id] = ph.Party(party_id=new_party_id, sio=sio)
    print(f'Party {new_party_id} created successfully!')
    return {'partyId': new_party_id, 'error': None}

@sio.event
def check_party_exists(sid, party_id):
    print(f'Checking existence of party: {party_id}')
    exists = party_id in rooms
    print(exists)
    return exists

@sio.event
def join_party(sid, party_id, nickname):
    print(f'Client {sid} trying to join party {party_id} with nickname {nickname}')
    if party_id not in rooms:
        return {'message': 'Party does not exist.'}
    party = rooms[party_id]
    clients_map[sid] = party_id
    sio.enter_room(sid, party_id)
    party.add_player(sid, nickname)
    if party.get_players_count() == 1:
        party.set_owner(sid)
    return

@sio.event
def get_players(sid):
    party_id = clients_map.get(sid)
    if not party_id or party_id not in rooms:
        return {'error': 'You are not in a party.'}
    party = rooms[party_id]
    players = party.get_player_list()
    sio.emit('send_player_list', players, to=sid)

@sio.event
def check_my_ownership(sid, party_id):
    print(f'Checking ownership for party {party_id} and client {sid}')
    if party_id not in rooms:
        return False
    party = rooms[party_id]
    is_owner = party.is_sid_owner(sid)
    return is_owner

@sio.event
def is_owner(sid, party_id, nickname):
    print(f'Checking if {nickname} is owner of party {party_id} for client {sid}')
    if party_id not in rooms:
        return {'error': 'Party does not exist.'}
    party = rooms[party_id]
    is_owner = party.is_nickname_owner(nickname)
    return is_owner

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 5000)), app)

# TODO: Handle situations where two players have the same nickname