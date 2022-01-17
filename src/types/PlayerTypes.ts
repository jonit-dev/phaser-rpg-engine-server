export enum PlayerGeckosEvents {
  Create = "Create",
  PositionUpdate = "PositionUpdate",
  Logout = "Logout",
}

export interface PlayerCreationPayload {
  id: string;
  x: number;
  y: number;
}

export interface PlayerLogoutPayload {
  id: string;
}
