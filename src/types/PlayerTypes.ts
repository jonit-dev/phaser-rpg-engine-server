//@ts-ignore
export enum PlayerGeckosEvents {
  Create = "Create",
  PositionUpdate = "PositionUpdate",
  CoordinateSync = "CoordinateSync",
  Logout = "Logout",
  PrivateMessage = "PrivateMessage",
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

export interface PlayerLogoutPayload {
  id: string;
}

export interface ICameraCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}
