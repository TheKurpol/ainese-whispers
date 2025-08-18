import eventlet
from enum import Enum

PLAYER_WAIT_TIME = 2

class GameMode(Enum):
    DRAWINGS = "drawings"
    STORY = "story"

class Game:
    def __init__(self, party_id: str):
        self.party_id = party_id
        self.loaded_players = []
        self.loading_timer = None
        self.game_started = False

    def init(self, num_players: int):
        self.num_players = num_players
        self.loading_timer = eventlet.spawn_after(PLAYER_WAIT_TIME, self.start)
        print(f'Initializing game for party {self.party_id}')

    def start(self):
        if self.game_started:
            return
        if len(self.loaded_players) < 3: # TODO: Replace with const
            # TODO: Request game deletion
            pass
        self.game_started = True
        print(f'Game started for party {self.party_id}')
        # TODO: Start game logic here
        self.shuffle_players()
        self.next_turn()

    def player_loaded(self, sid: str) -> tuple[int, int]:
        if sid not in self.loaded_players:
            self.loaded_players.append(sid)
        print(f'Player {sid} loaded in game for party {self.party_id}')
        print(f'{len(self.loaded_players)}/{self.num_players} players loaded')
        if len(self.loaded_players) == self.num_players and not self.game_started:
            if self.loading_timer is not None:
                self.loading_timer.kill()
                self.loading_timer = None
            self.start()
        return (len(self.loaded_players), self.num_players)

    def is_player_loaded(self, sid: str) -> bool:
        return sid in self.loaded_players
    
    # Virtual methods
    def shuffle_players(self):
        raise NotImplementedError("This method should be implemented in subclasses")
    def next_turn(self):
        raise NotImplementedError("This method should be implemented in subclasses")

# TODO: Delete player from game and lobby when they disconnect

class DrawingGame(Game):
    def __init__(self, party_id: str):
        super().__init__(party_id)
        # Additional initialization for drawing game
    def shuffle_players(self):
        print("test")
    def next_turn(self):
        pass

class StoryGame(Game):
    def __init__(self, party_id: str):
        super().__init__(party_id)
        # Additional initialization for story game
    def shuffle_players(self):
        pass
    def next_turn(self):
        pass
