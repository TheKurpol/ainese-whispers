import eventlet.wsgi
import socketio
import eventlet
from flask import Flask, request, jsonify
from flask_cors import CORS
from party import Party


sio = socketio.Server(cors_allowed_origins='*')
app = Flask(__name__)
app.wsgi_app = socketio.WSGIApp(sio, app.wsgi_app)
CORS(app)

rooms = {}

@sio.event
def connect(sid, environ):
    print(f'Client connected: {sid}')
    sio.emit('welcome', {'content': 'Welcome to the "lobby" subsite!'}, room=sid)

@sio.event
def disconnect(sid):
    print(f'Client disconnected: {sid}')

@app.route('/create_party', methods=['POST'])
def create_party():
    data = request.json
    if data is None:
        return jsonify({'error': 'No JSON data provided'}), 400
    party_id = data.get('partyId')
    print(party_id)
    if party_id in rooms:
        return jsonify({'error': f'Party {party_id} already exists!'}), 409
    rooms[party_id] = Party(party_id)
    return jsonify({'message': f'Party {party_id} created successfully!'}), 201
    

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('', 5000)), app)