export type VideoConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed';

export type DevicePermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';

export interface MediaDeviceState {
  cameraAvailable: boolean;
  micAvailable: boolean;
  cameraPermission: DevicePermissionState;
  micPermission: DevicePermissionState;
  isCameraEnabled: boolean;
  isMicEnabled: boolean;
}

export interface ParticipantStream {
  participantId: string;
  stream: MediaStream | null;
  isLocal: boolean;
}
