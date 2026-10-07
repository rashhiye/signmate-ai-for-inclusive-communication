import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import type { IRoomService } from '../services/RoomService';
import type { Room, CreateRoomDTO, JoinRoomDTO } from '../types/room';
import { firestore, isFirebaseConfigured } from './config';
import { generateRoomCode } from '../utils/roomCode';

export class FirestoreRoomAdapter implements IRoomService {
  async createRoom(dto: CreateRoomDTO): Promise<Room> {
    if (!firestore || !isFirebaseConfigured()) {
      throw new Error('Cloud Firestore is not initialized.');
    }

    const roomId = generateRoomCode(5);
    const roomRef = doc(firestore, 'rooms', roomId);

    const roomData: Room = {
      id: roomId,
      name: dto.name.trim(),
      hostId: 'current-user',
      createdAt: Date.now(),
      maxParticipants: 5,
      currentParticipantsCount: 1,
      status: 'active',
    };

    await setDoc(roomRef, {
      ...roomData,
      serverCreatedAt: serverTimestamp(),
    });

    return roomData;
  }

  async joinRoom(dto: JoinRoomDTO): Promise<Room> {
    if (!firestore || !isFirebaseConfigured()) {
      throw new Error('Cloud Firestore is not initialized.');
    }

    const roomRef = doc(firestore, 'rooms', dto.roomCode.trim().toUpperCase());
    const snap = await getDoc(roomRef);

    if (!snap.exists()) {
      throw new Error(`Room ${dto.roomCode} was not found or has ended.`);
    }

    const room = snap.data() as Room;

    if (room.currentParticipantsCount >= room.maxParticipants) {
      throw new Error(`Room ${dto.roomCode} is full (maximum ${room.maxParticipants} participants).`);
    }

    // Add participant presence
    const participantRef = doc(
      collection(firestore, 'rooms', dto.roomCode, 'participants'),
      dto.displayName
    );
    await setDoc(participantRef, {
      displayName: dto.displayName,
      joinedAt: Date.now(),
    });

    return room;
  }

  async getRoom(roomId: string): Promise<Room | null> {
    if (!firestore || !isFirebaseConfigured()) {
      return null;
    }

    const roomRef = doc(firestore, 'rooms', roomId.trim().toUpperCase());
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return null;
    return snap.data() as Room;
  }

  async leaveRoom(roomId: string, participantId: string): Promise<void> {
    if (!firestore || !isFirebaseConfigured()) return;

    try {
      const participantRef = doc(firestore, 'rooms', roomId, 'participants', participantId);
      await deleteDoc(participantRef);
    } catch {
      // Graceful exit
    }
  }

  subscribeToRoom(roomId: string, callback: (room: Room | null) => void): () => void {
    if (!firestore || !isFirebaseConfigured()) {
      callback(null);
      return () => {};
    }

    const roomRef = doc(firestore, 'rooms', roomId.trim().toUpperCase());
    return onSnapshot(roomRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as Room);
      } else {
        callback(null);
      }
    });
  }
}
