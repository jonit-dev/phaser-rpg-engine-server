//@ts-ignore
export enum PlayerGeckosEvents {
  Create = "Create",
  PositionUpdate = "PositionUpdate",
  CoordinateSync = "CoordinateSync",
  Logout = "Logout",
  PrivateMessage = "PrivateMessage",
}

export interface PlayerCreationPayload {
  id: string;
  name: string;
  x: number;
  y: number;
  channelId: string;
}

export interface PlayerLogoutPayload {
  id: string;
}

export interface PlayerPositionPayload {
  id: string;
  x: number;
  y: number;
  direction: string;
  name: string;
  channelId: string;
}

export interface IConnectedPlayer {
  id: string;
  name: string;
  x: number;
  y: number;
  channelId: string;
  direction?: string;
}
