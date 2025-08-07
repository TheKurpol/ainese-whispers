export interface WelcomeMessagePayload {
  content: string;
}

export interface ErrorMessage {
  message: string;
}

export interface CreatePartyPayload {
  partyId: string;
  error: string | null;
}

export interface Player {
  sid: string;
  nickname: string;
}

export interface ServerToClientEvents {
  welcome: (payload: WelcomeMessagePayload) => void;
  send_player_list: (list: Array<Player> ) => void;
}

export interface ClientToServerEvents {
  create_party: (callback: (payload: CreatePartyPayload) => void) => void;
  check_party_exists: (partyId: string, callback: (exists: boolean) => void) => void;
  join_party: (partyId: string, nickname: string, callback: (error: ErrorMessage | null) => void) => void;
  get_players: () => void;
  check_my_ownership: (partyId: string, callback: (amIOwner: boolean) => void) => void;
  is_owner: (partyId: string, nickname: string, callback: (isOwner: boolean) => void) => void;
}