export interface WelcomeMessagePayload {
  content: string;
}

export interface ErrorMessage {
  error: string;
}

export interface CreatePartyPayload {
  partyId: string;
  error: string | null;
}

export interface PlayerListPayload {
  list: Array<Player>;
  ownerSid: string | null;
}

export interface PlayerLoadedPayload {
  numLoaded: number;
  numPlayers: number;
}

export interface Player {
  sid: string;
  nickname: string;
}

export interface ServerToClientEvents {
  welcome: (payload: WelcomeMessagePayload) => void;
  send_player_list: (payload: PlayerListPayload) => void;
  game_initialized: () => void;
  player_loaded: (payload: PlayerLoadedPayload | ErrorMessage) => void;
  game_state_update: (newState: string) => void;
  ask_for_input: () => void;
}

export interface ClientToServerEvents {
  create_party: (callback: (payload: CreatePartyPayload) => void) => void;
  check_party_exists: (partyId: string, callback: (exists: boolean) => void) => void;
  join_party: (partyId: string, nickname: string, callback: (error: ErrorMessage | null) => void) => void;
  get_players: () => void;
  check_my_ownership: (partyId: string, callback: (amIOwner: boolean) => void) => void;
  is_owner: (partyId: string, nickname: string, callback: (isOwner: boolean) => void) => void;
  kick_player: (partyId: string, target_sid: string) => void;
  start_game: (partyId: string, callback: (error: ErrorMessage | null) => void) => void;
  game_loaded: (callback: (payload: PlayerLoadedPayload | ErrorMessage) => void) => void;
  submit_input: (input: string) => void;
}