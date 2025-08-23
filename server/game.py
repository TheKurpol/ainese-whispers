import eventlet
from enum import Enum

PLAYER_WAIT_TIME = 2

class GameMode(Enum):
    DRAWINGS = "drawings"
    STORY = "story"

class Game:
    def __init__(self, party_id: str, event_dispatcher):
        self.party_id = party_id
        self.loaded_players = []
        self.loading_timer = None
        self.game_started = False
        self.event_dispatcher = event_dispatcher
        self.current_round = 0
        self.ROUND_TIME = 5 # TODO: Make round time configurable
        self.ROUNDS = len(self.loaded_players)

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
        self.first_round()

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

    # abstract methods
    def shuffle_players(self):
        raise NotImplementedError("This method should be implemented by subclasses.")
    def first_round(self):
        raise NotImplementedError("This method should be implemented by subclasses.")

# TODO: Delete player from game and lobby when they disconnect

class DrawingGame(Game):
    def __init__(self, party_id: str, event_dispatcher):
        super().__init__(party_id, event_dispatcher)
        # Additional initialization for drawing game
    def shuffle_players(self):
        pass
    def first_round(self):
        self.event_dispatcher('game_state_update', 'drawingsFirstRound')
        eventlet.spawn_after(self.ROUND_TIME, self.finish_round)
    def finish_round(self):
        self.event_dispatcher('game_state_update', 'waitForNextDrawingsRound')
        self.current_round += 1
        if self.current_round < self.ROUNDS:
            self.next_round()
        else:
            print(f'Game over for party {self.party_id}')
    def next_round(self):
        self.event_dispatcher('game_state_update', 'drawingsRound')

class StoryGame(Game):
    def __init__(self, party_id: str, event_dispatcher):
        super().__init__(party_id, event_dispatcher)
        # Additional initialization for story game
    def shuffle_players(self):
        pass
    def first_round(self):
        pass
    def next_round(self):
        pass