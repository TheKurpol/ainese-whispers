import socketio
from enum import Enum

class GameMode(Enum):
    DRAWINGS = "drawings"
    STORY = "story"

class Game:
    def __init__(self, party_id: str, mode: GameMode):
        self.party_id = party_id
        self.mode = mode
        self.num_players = None
        self.loaded_players = []

    def init(self, num_players: int):
        self.num_players = num_players
        print(f'Initializing {self.mode.value} game for party {self.party_id}')

    def start(self):
        print(f'Game started for party {self.party_id} in mode {self.mode.value}')

    def player_loaded(self, sid: str) -> tuple[int, int]:
        self.loaded_players.append(sid)
        print(f'Player {sid} loaded in {self.mode.value} game for party {self.party_id}')
        print(f'{len(self.loaded_players)}/{self.num_players} players loaded')
        if len(self.loaded_players) == self.num_players:
            self.start()
        return (len(self.loaded_players), self.num_players)

    def is_player_loaded(self, sid: str) -> bool:
        return sid in self.loaded_players
