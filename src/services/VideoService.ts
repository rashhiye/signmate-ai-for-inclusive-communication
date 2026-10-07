import type { ParticipantStream, VideoConnectionState } from '../types/video';
import { ServiceNotImplementedError } from './AuthService';

export interface IVideoService {
  initialize(appId?: string): Promise<void>;
  joinRoom(roomCode: string, user: { uid: string; displayName: string }): Promise<void>;
  leaveRoom(): Promise<void>;
  muteMicrophone(muted: boolean): Promise<boolean>;
  toggleCamera(enabled: boolean): Promise<boolean>;
  getLocalStream(): MediaStream | null;
  getConnectionState(): VideoConnectionState;
  onStreamsChanged(callback: (streams: ParticipantStream[]) => void): () => void;
  onConnectionStateChanged(callback: (state: VideoConnectionState) => void): () => void;
}

/**
 * Base VideoService abstraction.
 * Prepared for ZEGOCLOUD Video Conference Web SDK integration in upcoming phase.
 */
export class VideoService implements IVideoService {
  private static instance: VideoService;
  private connectionState: VideoConnectionState = 'disconnected';

  public static getInstance(): VideoService {
    if (!VideoService.instance) {
      VideoService.instance = new VideoService();
    }
    return VideoService.instance;
  }

  async initialize(_appId?: string): Promise<void> {
    throw new ServiceNotImplementedError('VideoService', 'initialize');
  }

  async joinRoom(_roomCode: string, _user: { uid: string; displayName: string }): Promise<void> {
    throw new ServiceNotImplementedError('VideoService', 'joinRoom');
  }

  async leaveRoom(): Promise<void> {
    throw new ServiceNotImplementedError('VideoService', 'leaveRoom');
  }

  async muteMicrophone(_muted: boolean): Promise<boolean> {
    throw new ServiceNotImplementedError('VideoService', 'muteMicrophone');
  }

  async toggleCamera(_enabled: boolean): Promise<boolean> {
    throw new ServiceNotImplementedError('VideoService', 'toggleCamera');
  }

  getLocalStream(): MediaStream | null {
    return null;
  }

  getConnectionState(): VideoConnectionState {
    return this.connectionState;
  }

  onStreamsChanged(_callback: (streams: ParticipantStream[]) => void): () => void {
    return () => {};
  }

  onConnectionStateChanged(_callback: (state: VideoConnectionState) => void): () => void {
    return () => {};
  }
}

export const videoService = VideoService.getInstance();
