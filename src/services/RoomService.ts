import type { Room, CreateRoomDTO, JoinRoomDTO } from '../types/room';
import { ServiceNotImplementedError } from './AuthService';

export interface IRoomService {
  createRoom(dto: CreateRoomDTO): Promise<Room>;
  joinRoom(dto: JoinRoomDTO): Promise<Room>;
  getRoom(roomId: string): Promise<Room | null>;
  leaveRoom(roomId: string, participantId: string): Promise<void>;
  subscribeToRoom(roomId: string, callback: (room: Room | null) => void): () => void;
}

/**
 * Base RoomService abstraction.
 * Prepared for Cloud Firestore persistence in upcoming phase.
 */
export class RoomService implements IRoomService {
  private static instance: RoomService;

  public static getInstance(): RoomService {
    if (!RoomService.instance) {
      RoomService.instance = new RoomService();
    }
    return RoomService.instance;
  }

  async createRoom(_dto: CreateRoomDTO): Promise<Room> {
    throw new ServiceNotImplementedError('RoomService', 'createRoom');
  }

  async joinRoom(_dto: JoinRoomDTO): Promise<Room> {
    throw new ServiceNotImplementedError('RoomService', 'joinRoom');
  }

  async getRoom(_roomId: string): Promise<Room | null> {
    throw new ServiceNotImplementedError('RoomService', 'getRoom');
  }

  async leaveRoom(_roomId: string, _participantId: string): Promise<void> {
    throw new ServiceNotImplementedError('RoomService', 'leaveRoom');
  }

  subscribeToRoom(_roomId: string, _callback: (room: Room | null) => void): () => void {
    return () => {};
  }
}

export const roomService = RoomService.getInstance();
