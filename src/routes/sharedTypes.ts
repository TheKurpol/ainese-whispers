export interface WelcomeMessagePayload {
  content: string;
}

export interface CreatePartyPayload {
  partyId: string;
  error: string | null;
}

export interface ServerToClientEvents {
  welcome: (payload: WelcomeMessagePayload) => void;
}

export interface ClientToServerEvents {
  create_party: () => CreatePartyPayload;
  check_party_exists: (partyId: string, callback: (exists: boolean) => void) => void;
}