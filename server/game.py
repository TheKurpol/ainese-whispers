import eventlet
from enum import Enum
import random

PLAYER_WAIT_TIME = 2

class GameMode(Enum):
    DRAWINGS = "drawings"
    STORY = "story"

class Game:
    def __init__(self, party_id: str, event_dispatcher):
        self.party_id = party_id
        self.loaded_players = []
        self.loading_timer = None
        self.submit_timer = None
        self.game_started = False
        self.event_dispatcher = event_dispatcher
        self.current_round = 0
        self.shuffled_players = []
        self.awaited_players = []
        self.player_inputs = {}
        self.stories = []
        self.ROUND_TIME = 40 # TODO: Make round time configurable
        self.ROUNDS = 0 # Later we'll make it configurable in the lobby
        self.MAX_SUBMIT_WAIT_TIME = 3
        self.LOST_SENTENCE = "Player went to buy a milk"

    def init(self, num_players: int):
        self.num_players = num_players
        self.loading_timer = eventlet.spawn_after(PLAYER_WAIT_TIME, self.start)
        self.ROUNDS = self.num_players
        for _ in range(self.num_players):
            self.stories.append([])
        print(f'Initializing game for party {self.party_id}')

    def start(self):
        if self.game_started:
            return
        if len(self.loaded_players) < 3: # TODO: Replace with const
            # TODO: Request game deletion
            pass
        self.game_started = True
        print(f'Game started for party {self.party_id}')
        self.event_dispatcher('remove_disconnected_players', self.loaded_players)
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
    

    def submit_input(self, sid: str, player_input: str):
        self.player_inputs[sid] = player_input
        if sid in self.awaited_players:
            self.awaited_players.remove(sid)
        if len(self.awaited_players) == 0 and self.submit_timer is not None:
            self.submit_timer.kill()
            self.submit_timer = None
            self.init_next_round()

    def is_player_loaded(self, sid: str) -> bool:
        return sid in self.loaded_players

    # abstract methods
    def shuffle_players(self):
        raise NotImplementedError("This method should be implemented by subclasses.")
    def first_round(self):
        raise NotImplementedError("This method should be implemented by subclasses.")
    def init_next_round(self):
        raise NotImplementedError("This method should be implemented by subclasses.")

# TODO: Delete player from game and lobby when they disconnect

class DrawingGame(Game):
    def __init__(self, party_id: str, event_dispatcher):
        super().__init__(party_id, event_dispatcher)
        # Additional initialization for drawing game
    def shuffle_players(self):
        self.shuffled_players = self.loaded_players.copy()
        random.shuffle(self.shuffled_players)
    def first_round(self):
        self.event_dispatcher('game_state_update', 'drawingsFirstRound')
        eventlet.spawn_after(self.ROUND_TIME, self.finish_round)
    def finish_round(self):
        self.event_dispatcher('ask_for_input')
        self.awaited_players = self.loaded_players.copy()
        self.submit_timer = eventlet.spawn_after(self.MAX_SUBMIT_WAIT_TIME, self.init_next_round)
    def init_next_round(self):
        self.event_dispatcher('game_state_update', 'waitForNextDrawingsRound')
        for sid in self.shuffled_players:
            if sid not in self.player_inputs:
                self.stories[self.shuffled_players.index(sid)-self.current_round].append(self.stories[self.shuffled_players.index(sid)-self.current_round][2 * (self.current_round - 1)] if self.current_round > 0 else self.LOST_SENTENCE)
            else:
                self.stories[self.shuffled_players.index(sid)-self.current_round].append(self.player_inputs[sid])
        self.current_round += 1
        if self.current_round < self.ROUNDS:
            self.next_round()
        else:
            print(self.stories)
    def next_round(self):
        self.event_dispatcher('game_state_update', 'drawingsRound')
        eventlet.spawn_after(self.ROUND_TIME, self.finish_round)

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