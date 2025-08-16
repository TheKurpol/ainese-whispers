import eventlet
from enum import Enum

PLAYER_WAIT_TIME = 2

class GameMode(Enum):
    DRAWINGS = "drawings"
    STORY = "story"

class Game:
    def __init__(self, party_id: str, mode: GameMode):
        self.party_id = party_id
        self.mode = mode
        self.num_players = None
        self.loaded_players = []
        self.loading_timer = None
        self.game_started = False

    def init(self, num_players: int):
        self.num_players = num_players
        print(f'Initializing {self.mode.value} game for party {self.party_id}')

    def start(self):
        print("[DEBUG] start() called")
        if self.game_started:
            print("[DEBUG] Game already started, skipping.")
            return
        self.game_started = True
        if self.loading_timer:
            print("[DEBUG] Cancelling timer in start().")
            self.loading_timer.kill()
            self.loading_timer = None
        print(f'Game started for party {self.party_id} in mode {self.mode.value}')

    def player_loaded(self, sid: str) -> tuple[int, int]:
        if sid not in self.loaded_players:
            self.loaded_players.append(sid)
        print(f'Player {sid} loaded in {self.mode.value} game for party {self.party_id}')
        print(f'{len(self.loaded_players)}/{self.num_players} players loaded')
        if not self.loading_timer and not self.game_started:
            print("[DEBUG] Starting loading timer.")
            self.loading_timer = eventlet.spawn_after(PLAYER_WAIT_TIME, self.start)
        if len(self.loaded_players) == self.num_players and not self.game_started:
            print("[DEBUG] All players loaded, starting game immediately.")
            self.start()
        return (len(self.loaded_players), self.num_players)

    def is_player_loaded(self, sid: str) -> bool:
        return sid in self.loaded_players

# TODO: Don't run timer when it is already running (fixing)
# TODO: Don't make loading_timer.kill() take forever because game won't start