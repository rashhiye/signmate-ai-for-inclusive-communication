import { useState, useEffect, useCallback, useRef } from 'react';
import type { DevicePermissionState } from '../types/video';

export interface UseMediaDevicesResult {
  localStream: MediaStream | null;
  cameraAvailable: boolean;
  micAvailable: boolean;
  cameraPermission: DevicePermissionState;
  micPermission: DevicePermissionState;
  isCameraEnabled: boolean;
  isMicEnabled: boolean;
  deviceError: string | null;
  startLocalMedia: () => Promise<MediaStream | null>;
  stopLocalMedia: () => void;
  toggleCamera: () => boolean;
  toggleMicrophone: () => boolean;
}

export function useMediaDevices(): UseMediaDevicesResult {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(true);
  const [micAvailable, setMicAvailable] = useState<boolean>(true);
  const [cameraPermission, setCameraPermission] = useState<DevicePermissionState>('prompt');
  const [micPermission, setMicPermission] = useState<DevicePermissionState>('prompt');
  const [isCameraEnabled, setIsCameraEnabled] = useState<boolean>(true);
  const [isMicEnabled, setIsMicEnabled] = useState<boolean>(true);
  const [deviceError, setDeviceError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  // Check hardware availability and permissions on mount
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      setCameraAvailable(false);
      setMicAvailable(false);
      setDeviceError('Media devices API not supported in this browser environment.');
      return;
    }

    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        const hasCam = devices.some((d) => d.kind === 'videoinput');
        const hasMic = devices.some((d) => d.kind === 'audioinput');
        setCameraAvailable(hasCam);
        setMicAvailable(hasMic);
      })
      .catch((err) => {
        console.warn('Could not enumerate media devices:', err);
      });

    // Check permissions API if supported
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'camera' as PermissionName })
        .then((res) => {
          setCameraPermission(res.state as DevicePermissionState);
          res.onchange = () => setCameraPermission(res.state as DevicePermissionState);
        })
        .catch(() => {});

      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((res) => {
          setMicPermission(res.state as DevicePermissionState);
          res.onchange = () => setMicPermission(res.state as DevicePermissionState);
        })
        .catch(() => {});
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startLocalMedia = useCallback(async (): Promise<MediaStream | null> => {
    setDeviceError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera and microphone access is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: true,
      });

      streamRef.current = stream;
      setLocalStream(stream);
      setCameraPermission('granted');
      setMicPermission('granted');
      setIsCameraEnabled(true);
      setIsMicEnabled(true);
      return stream;
    } catch (err: unknown) {
      const error = err as Error;
      let errorMsg = 'Failed to access camera/microphone.';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMsg = 'Camera and microphone permissions were denied. Please grant access in your browser settings.';
        setCameraPermission('denied');
        setMicPermission('denied');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera or microphone found on this device.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMsg = 'Hardware device is currently occupied by another application.';
      }

      setDeviceError(errorMsg);
      return null;
    }
  }, []);

  const stopLocalMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setLocalStream(null);
  }, []);

  const toggleCamera = useCallback((): boolean => {
    if (!streamRef.current) return false;
    const videoTracks = streamRef.current.getVideoTracks();
    if (videoTracks.length === 0) return false;

    const nextState = !isCameraEnabled;
    videoTracks.forEach((track) => {
      track.enabled = nextState;
    });
    setIsCameraEnabled(nextState);
    return nextState;
  }, [isCameraEnabled]);

  const toggleMicrophone = useCallback((): boolean => {
    if (!streamRef.current) return false;
    const audioTracks = streamRef.current.getAudioTracks();
    if (audioTracks.length === 0) return false;

    const nextState = !isMicEnabled;
    audioTracks.forEach((track) => {
      track.enabled = nextState;
    });
    setIsMicEnabled(nextState);
    return nextState;
  }, [isMicEnabled]);

  return {
    localStream,
    cameraAvailable,
    micAvailable,
    cameraPermission,
    micPermission,
    isCameraEnabled,
    isMicEnabled,
    deviceError,
    startLocalMedia,
    stopLocalMedia,
    toggleCamera,
    toggleMicrophone,
  };
}
