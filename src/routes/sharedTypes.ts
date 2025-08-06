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

export interface ServerToClientEvents {
  welcome: (payload: WelcomeMessagePayload) => void;
  party_player_update: (payload: { players: Array<string> }) => void;
}

export interface ClientToServerEvents {
  create_party: (creator_nickname: string) => CreatePartyPayload; 
  check_party_exists: (partyId: string, callback: (exists: boolean) => void) => void;
  join_party: (partyId: string, nickname: string) => ErrorMessage | null;
}