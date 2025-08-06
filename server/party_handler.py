import socketio

class Party:
    def __init__(self, party_id: str, sio: socketio.Server):
        self.party_id = party_id
        self.players = {}
        self.messages = []
        self.owner_sid = None
        self.sio = sio

    def add_player(self, sid: str, nickname: str):
        if sid in self.players:
            return {'error': 'Player already in party.'}
        self.players[sid] = nickname
        if not self.owner_sid:
            self.owner_sid = sid
        return {'message': f'{nickname} joined the party.', 'error': None}