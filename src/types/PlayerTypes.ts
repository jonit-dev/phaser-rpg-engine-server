//@ts-ignore
export enum PlayerGeckosEvents {
  PlayerCreate = "PlayerCreate",
  PlayerPositionUpdate = "PlayerPositionUpdate",
  PlayerLogout = "PlayerLogout",
  PlayerPrivateMessage = "PlayerPrivateMessage",
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
  otherPlayersInView?: IConnectedPlayer[];
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
