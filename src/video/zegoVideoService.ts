import type { IVideoService } from '../services/VideoService';
import type { ParticipantStream, VideoConnectionState } from '../types/video';
import { isZegoConfigured } from './zegoConfig';

/**
 * ZEGOCLOUD Video Conference Adapter
 * Prepares the video connection lifecycle for 3-5 participants.
 */
export class ZegoVideoAdapter implements IVideoService {
  private connectionState: VideoConnectionState = 'disconnected';

  async initialize(_appId?: string): Promise<void> {
    if (!isZegoConfigured()) {
      throw new Error('ZEGOCLOUD AppID is not configured in VITE_ZEGO_APP_ID.');
    }
  }

  async joinRoom(roomCode: string, _user: { uid: string; displayName: string }): Promise<void> {
    if (!isZegoConfigured()) {
      throw new Error(`ZEGOCLOUD is pending integration in Phase 3. Room: ${roomCode}`);
    }
  }

  async leaveRoom(): Promise<void> {
    this.connectionState = 'disconnected';
  }

  async muteMicrophone(_muted: boolean): Promise<boolean> {
    return true;
  }

  async toggleCamera(_enabled: boolean): Promise<boolean> {
    return true;
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
