import eventlet.wsgi
import socketio
import eventlet
from flask import Flask, request, jsonify
from flask_cors import CORS
from party import *
from utils import generate_random_party_id


sio = socketio.Server(cors_allowed_origins='*')
app = Flask(__name__)
app.wsgi_app = socketio.WSGIApp(sio, app.wsgi_app)
CORS(app)

rooms: dict[str, Party] = {}
clients_map: dict[str, str] = {}

@sio.event
def connect(sid, environ):
    print(f'Client connected: {sid}')
    sio.emit('welcome', {'content': 'I am always here for you'}, to=sid)

@sio.event
def disconnect(sid):
    print(f'Client disconnected: {sid}')
    party_id = clients_map.pop(sid, None)
    if party_id and party_id in rooms:
        party = rooms[party_id]
        party.remove_player(sid)

@sio.event
def create_party(sid):
    new_party_id = generate_random_party_id()
    if new_party_id in rooms:
        return {'error': f'Party {new_party_id} already exists!'}
    rooms[new_party_id] = Party(party_id=new_party_id, sio=sio)
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
    if party.is_game_started():
        return {'message': 'Game has already started.'}
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
    sio.emit('send_player_list', {'list': party.get_player_list(), 'ownerSid': party.get_owner_sid()}, to=sid)

@sio.event
def check_my_ownership(sid, party_id):
    print(f'Checking ownership for party {party_id} and client {sid}')
    if party_id not in rooms:
        return False
    party = rooms[party_id]
    is_owner = party.is_owner(sid)
    return is_owner

@sio.event
def is_owner(sid, party_id, target_sid):
    print(f'Checking if {target_sid} is owner of party {party_id} for client {sid}')
    if party_id not in rooms:
        return {'error': 'Party does not exist.'}
    party = rooms[party_id]
    is_owner = party.is_owner(target_sid)
    return is_owner

@sio.event
def kick_player(sid, party_id, target_sid):
    print(f'Client {sid} is trying to kick {target_sid} from party {party_id}')
    if party_id not in rooms:
        return {'error': 'Party does not exist.'}
    party = rooms[party_id]
    if not party.is_owner(sid):
        return {'error': 'Only the owner can kick players.'}
    party.remove_player(target_sid)
    return {'success': True}

@sio.event
def start_game(sid, party_id):
    print(f'Client {sid} is trying to start the game in party {party_id}')
    if party_id not in rooms:
        return {'error': 'Party does not exist.'}
    party = rooms[party_id]
    if not party.is_owner(sid):
        return {'error': 'Only the owner can start the game.'}
    return party.start_game()

@sio.event
def game_loaded(sid):
    party_id = clients_map.get(sid)
    if not party_id or party_id not in rooms:
        return {'error': 'You are not in a party.'}
    party = rooms[party_id]
    if party.is_player_loaded(sid):
        return {'error': 'Player already loaded.'}
    num_loaded, num_players = party.player_loaded(sid)
    return {'numLoaded': num_loaded, 'numPlayers': num_players}

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 5000)), app)