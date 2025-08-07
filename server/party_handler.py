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
        self.send_player_list()
        return {'message': f'{nickname} joined the party.', 'error': None}
    
    def set_owner(self, sid: str):
        if sid in self.players:
            self.owner_sid = sid
            return {'message': f'{self.players[sid]} is now the owner.', 'error': None}
        return {'error': 'Player not found in party.'}
    
    def get_player_list(self):
        player_list = [{'sid': sid, 'nickname': nickname} for sid, nickname in self.players.items()]
        return player_list
    
    def get_players_count(self):
        return len(self.players)
    
    def is_sid_owner(self, sid: str):
        return sid == self.owner_sid
    
    def is_nickname_owner(self, nickname: str):
        for player_sid, player_nickname in self.players.items():
            if player_nickname == nickname:
                return player_sid == self.owner_sid
        return False

    def send_player_list(self):
        player_list = self.get_player_list()
        
        print(f'Sending player list to party {self.party_id}: {player_list}')
        self.sio.emit('welcome', {'content': f'Welcome to party {self.party_id}!'}, to=self.party_id)
        self.sio.emit('send_player_list', player_list, to=self.party_id, skip_sid=self.owner_sid)