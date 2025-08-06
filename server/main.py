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

@sio.event
def connect(sid, environ):
    print(f'Client connected: {sid}')
    sio.emit('welcome', {'content': 'I am always here for you'}, to=sid)

@sio.event
def disconnect(sid):
    print(f'Client disconnected: {sid}')

@sio.event
def create_party(sid, creator_nickname):
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
    party.add_player(sid, nickname)
    print(len(party.players))
    return

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 5000)), app)

# TODO: Pomyśleć jak przekazywać graczom wiadomości o zmianach w party, czy osobne rodzaje eventów dla różnych zmian?
# TODO: Jak przekazać frontendowi ownera, że jest ownerem i jak dać mu dodatkowe uprawnienia?