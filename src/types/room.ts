export type RoomStatus = 'active' | 'ended' | 'waiting';

export interface RoomParticipant {
  uid: string;
  displayName: string;
  isHost: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isAISpeaker?: boolean;
  joinedAt: number;
}

export interface Room {
  id: string; // Formatted as SM-XXXXXX (e.g. SM-952JW)
  name: string;
  hostId: string;
  createdAt: number;
  maxParticipants: number; // Target 3–5 participants
  currentParticipantsCount: number;
  status: RoomStatus;
}

export interface CreateRoomDTO {
  name: string;
}

export interface JoinRoomDTO {
  roomCode: string;
  displayName: string;
}

export type RoomErrorCode =
  | 'INVALID_CODE'
  | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL'
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'SERVICE_UNAVAILABLE';
