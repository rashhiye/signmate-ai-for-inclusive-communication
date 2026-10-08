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
  toggleCamera: () => Promise<boolean>;
  toggleMicrophone: () => Promise<boolean>;
}

async function requestMediaStream(constraints: MediaStreamConstraints): Promise<MediaStream> {
  if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
    return await navigator.mediaDevices.getUserMedia(constraints);
  }

  // Fallback to legacy vendor implementations
  const legacyGetUserMedia =
    (navigator as any).getUserMedia ||
    (navigator as any).webkitGetUserMedia ||
    (navigator as any).mozGetUserMedia ||
    (navigator as any).msGetUserMedia;

  if (legacyGetUserMedia) {
    return new Promise((resolve, reject) => {
      legacyGetUserMedia.call(navigator, constraints, resolve, reject);
    });
  }

  throw new Error('NOT_SUPPORTED');
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
    const hasMedia = !!(
      navigator.mediaDevices?.enumerateDevices ||
      navigator.mediaDevices?.getUserMedia ||
      (navigator as any).webkitGetUserMedia ||
      (navigator as any).getUserMedia
    );

    // If browser completely strips media APIs on HTTP network IP, seamlessly upgrade to HTTPS
    if (!hasMedia && window.isSecureContext === false && window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.warn('[SignMate] Browser hides camera API on unencrypted HTTP IP. Upgrading to HTTPS...');
      window.location.href = window.location.href.replace('http:', 'https:');
      return;
    }

    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const hasCam = devices.some((d) => d.kind === 'videoinput');
          const hasMic = devices.some((d) => d.kind === 'audioinput');
          setCameraAvailable(hasCam);
          setMicAvailable(hasMic);
        })
        .catch((err) => {
          console.warn('[SignMate] Could not enumerate media devices:', err);
        });
    }

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
      let stream: MediaStream | null = null;
      let acquiredAudio = false;

      // Tier 1: Try ideal video + audio
      try {
        stream = await requestMediaStream({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: true,
        });
        acquiredAudio = true;
      } catch (tier1Err) {
        console.warn('[SignMate] Initial video+audio getUserMedia failed, retrying video only:', tier1Err);

        // Tier 2: Try ideal video without audio (handles missing mic or denied mic)
        try {
          stream = await requestMediaStream({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user',
            },
            audio: false,
          });
        } catch (tier2Err) {
          console.warn('[SignMate] Constrained video failed, retrying unconstrained video:', tier2Err);

          // Tier 3: Unconstrained basic video
          try {
            stream = await requestMediaStream({
              video: true,
              audio: false,
            });
          } catch (tier3Err) {
            // If completely blocked by browser on plain HTTP, upgrade to HTTPS
            if (window.isSecureContext === false && window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
              console.warn('[SignMate] Camera blocked on HTTP IP. Upgrading to HTTPS...');
              window.location.href = window.location.href.replace('http:', 'https:');
              return null;
            }
            throw tier3Err;
          }
        }
      }

      if (!stream) {
        throw new Error('Failed to start camera stream.');
      }

      // If we got video but not audio in initial attempt, try to softly attach audio
      if (!acquiredAudio) {
        try {
          const audioStream = await requestMediaStream({ audio: true });
          const audioTrack = audioStream.getAudioTracks()[0];
          if (audioTrack) {
            stream.addTrack(audioTrack);
            setIsMicEnabled(true);
          }
        } catch {
          console.info('[SignMate] Running in video-only mode (microphone unavailable).');
          setIsMicEnabled(false);
        }
      } else {
        setIsMicEnabled(true);
      }

      streamRef.current = stream;
      setLocalStream(stream);
      setCameraPermission('granted');
      setIsCameraEnabled(true);
      setDeviceError(null);
      return stream;
    } catch (err: unknown) {
      const error = err as Error;
      let errorMsg = 'Failed to access camera/microphone.';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission was denied. Please allow camera permissions in your browser URL bar.';
        setCameraPermission('denied');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera found. Please plug in or enable a webcam.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMsg = 'Camera is occupied by another application (e.g. Zoom or another browser tab).';
      } else if (error.message === 'NOT_SUPPORTED') {
        errorMsg = 'Camera access requires HTTPS or localhost on this browser.';
      } else if (error.message) {
        errorMsg = error.message;
      }

      console.error('[SignMate] Camera access error:', error);
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

  const toggleCamera = useCallback(async (): Promise<boolean> => {
    // If no stream exists or tracks are missing/ended, start the camera
    if (!streamRef.current || streamRef.current.getVideoTracks().length === 0) {
      const s = await startLocalMedia();
      return !!s;
    }

    const videoTracks = streamRef.current.getVideoTracks();
    const hasLiveTrack = videoTracks.some((t) => t.readyState === 'live');

    if (!hasLiveTrack) {
      const s = await startLocalMedia();
      return !!s;
    }

    const nextState = !isCameraEnabled;
    videoTracks.forEach((track) => {
      track.enabled = nextState;
    });
    setIsCameraEnabled(nextState);
    return nextState;
  }, [isCameraEnabled, startLocalMedia]);

  const toggleMicrophone = useCallback(async (): Promise<boolean> => {
    if (!streamRef.current || streamRef.current.getAudioTracks().length === 0) {
      try {
        const audioStream = await requestMediaStream({ audio: true });
        const track = audioStream.getAudioTracks()[0];
        if (track && streamRef.current) {
          streamRef.current.addTrack(track);
          setIsMicEnabled(true);
          return true;
        }
      } catch (err) {
        console.warn('[SignMate] Cannot enable microphone:', err);
        return false;
      }
    }

    const audioTracks = streamRef.current?.getAudioTracks() || [];
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
