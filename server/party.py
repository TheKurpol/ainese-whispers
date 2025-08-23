import socketio
from game import *

class Party:
    def __init__(self, party_id: str, sio: socketio.Server):
        self.party_id = party_id
        self.players = {}
        self.messages = []
        self.owner_sid = None
        self.sio = sio
        self.mode = GameMode.DRAWINGS
        self.MIN_PLAYERS = 1 # for dev purposes only, TODO: switch to 3 in production
        self.MAX_PLAYERS = 10
        self.game = DrawingGame(party_id, self.event_dispatcher)

    def event_dispatcher(self, event_name: str, data: dict):
        self.sio.emit(event_name, data, to=self.party_id)

    def add_player(self, sid: str, nickname: str):
        if sid in self.players:
            return {'error': 'Player already in party.'}
        self.players[sid] = nickname
        if not self.owner_sid:
            self.owner_sid = sid
        self.send_player_list()
        return {'message': f'{nickname} joined the party.', 'error': None}
    
    def remove_player(self, sid: str):
        if sid not in self.players:
            return {'error': 'Player not found in party.'}
        del self.players[sid]
        if sid == self.owner_sid:
            if self.players:
                self.owner_sid = next(iter(self.players))
                print(f'New owner set: {self.players[self.owner_sid]}')
            else:
                self.owner_sid = None
        self.send_player_list()
        return {'message': f'Player left the party.', 'error': None}

    def set_owner(self, sid: str):
        if sid in self.players:
            self.owner_sid = sid
            return {'message': f'{self.players[sid]} is now the owner.', 'error': None}
        return {'error': 'Player not found in party.'}
    
    def start_game(self):
        print(f'Starting game in party {self.party_id}')
        if self.mode == GameMode.DRAWINGS:
            self.game = DrawingGame(self.party_id, self.event_dispatcher)
        elif self.mode == GameMode.STORY:
            self.game = StoryGame(self.party_id, self.event_dispatcher)
        if self.game.game_started:
            return {'error': 'Game has already started.'}
        if self.get_players_count() < self.MIN_PLAYERS:
            return {'error': 'Not enough players to start the game.'}
        if self.get_players_count() > self.MAX_PLAYERS:
            return {'error': 'Too many players to start the game.'}
        self.game.init(self.get_players_count())
        self.sio.emit('game_initialized', to=self.party_id)
        return

    def player_loaded(self, sid: str):
        loaded_players, num_players = self.game.player_loaded(sid)
        self.sio.emit('player_loaded', {'numLoaded': loaded_players, 'numPlayers': num_players}, to=self.party_id)
        return (loaded_players, num_players)

    def is_player_loaded(self, sid: str) -> bool:
        return self.game.is_player_loaded(sid)

    def get_player_list(self):
        player_list = [{'sid': sid, 'nickname': nickname} for sid, nickname in self.players.items()]
        return player_list

    def get_owner_sid(self):
        return self.owner_sid

    def get_players_count(self):
        return len(self.players)
    
    def is_owner(self, sid: str):
        return sid == self.owner_sid

    def send_player_list(self):
        player_list = self.get_player_list()
        owner_sid = self.get_owner_sid()
        
        print(f'Sending player list to party {self.party_id}: {player_list}')
        self.sio.emit('send_player_list', {'list': player_list, 'ownerSid': owner_sid}, to=self.party_id)

    def is_game_started(self):
        return self.game.game_started
    