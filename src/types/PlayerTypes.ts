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
  name: string;
  x: number;
  y: number;
  direction: string;
  channelId: string;
  isMoving?: boolean;
  cameraCoordinates: ICameraCoordinates;
}

export interface ICameraCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IConnectedPlayer {
  id: string;
  name: string;
  x: number;
  y: number;
  channelId: string;
  direction?: string;
  isMoving?: boolean;
  cameraCoordinates: ICameraCoordinates;
}

export interface IPlayersView {
  [playerId: string]: IConnectedPlayer;
}
