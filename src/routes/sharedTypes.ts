export interface IWelcomeMessagePayload {
  content: string;
}

export interface ServerToClientEvents {
  welcome: (payload: IWelcomeMessagePayload) => void;
}

export interface ClientToServerEvents {

}