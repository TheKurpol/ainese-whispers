import eventlet.wsgi
import socketio
import eventlet
from flask import Flask, request, jsonify
from flask_cors import CORS
from party import Party
from utils import generate_random_party_id


sio = socketio.Server(cors_allowed_origins='*')
app = Flask(__name__)
app.wsgi_app = socketio.WSGIApp(sio, app.wsgi_app)
CORS(app)

rooms = {}

@sio.event
def connect(sid, environ):
    print(f'Client connected: {sid}')
    sio.emit('welcome', {'content': 'I am always here for you'}, room=sid)

@sio.event
def disconnect(sid):
    print(f'Client disconnected: {sid}')

@sio.event
def create_party(sid):
    new_party_id = generate_random_party_id()
    if new_party_id in rooms:
        return {'error': f'Party {new_party_id} already exists!'}
    rooms[new_party_id] = Party(new_party_id)
    print(f'Party {new_party_id} created successfully!')
    print(len(rooms))
    return {'partyId': new_party_id, 'error': None}

@sio.event
def check_party_exists(sid, party_id):
    print(f'Checking existence of party: {party_id}')
    exists = party_id in rooms
    print(exists)
    return exists
    

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 5000)), app)