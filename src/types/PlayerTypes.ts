//@ts-ignore

export enum PlayerGeckosEvents {
  Create = "Create",
  PositionUpdate = "PositionUpdate",
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

export interface IConnectedPlayer {
  id: string;
  name: string;
  x: number;
  y: number;
  channelId: string;
}
