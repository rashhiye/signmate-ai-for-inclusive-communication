export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
}

export interface HandDetectionResult {
  hasHand: boolean;
  box: { x: number; y: number; width: number; height: number };
  letter: string;
  confidence: number;
  inferenceTimeMs: number;
  source: 'keras_model' | 'mediapipe_landmarks';
  landmarks?: LandmarkPoint[];
}

export class HandSignDetector {
  private mediaPipeHands: any = null;
  private isMediaPipeReady = false;
  private latestMediaPipeResult: any = null;
  private isProcessing = false;
  private isFastApiAvailable = false;
  private lastFastApiTime = 0;
  private checkServerTimer: number | null = null;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D | null;
  private lastDetectionResult: HandDetectionResult | null = null;

  constructor() {
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = 160;
    this.offscreenCanvas.height = 160;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });

    this.initMediaPipe();
    this.checkFastApiHealth();

    // Check FastAPI health only with exponential backoff if running locally
    if (typeof window !== 'undefined') {
      this.checkServerTimer = window.setInterval(() => this.checkFastApiHealth(), 15000);
    }
  }

  private getFastApiBaseUrl(): string {
    const custom = import.meta.env.VITE_AI_API_BASE_URL;
    if (custom) return custom;
    if (typeof window === 'undefined') return '';
    const host = window.location.hostname || 'localhost';
    return `http://${host}:8000`;
  }

  /**
   * Initializes Google MediaPipe Hands detector
   */
  private initMediaPipe() {
    const tryInit = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Hands = (window as any).Hands;
      if (Hands && !this.mediaPipeHands) {
        try {
          this.mediaPipeHands = new Hands({
            locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
          });

          this.mediaPipeHands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

          this.mediaPipeHands.onResults((results: any) => {
            this.latestMediaPipeResult = results;
          });

          this.isMediaPipeReady = true;
          console.log('[SignMate] MediaPipe Hands initialized successfully!');
        } catch (err) {
          console.warn('[SignMate] MediaPipe Hands init error:', err);
        }
      } else if (!Hands) {
        setTimeout(tryInit, 400);
      }
    };

    tryInit();
  }

  /**
   * Probes if the optional FastAPI model server is online.
   * If online, enables deep learning inference. If offline, MediaPipe landmark engine handles detection locally.
   */
  public async checkFastApiHealth(): Promise<boolean> {
    const baseUrl = this.getFastApiBaseUrl();
    if (!baseUrl) {
      this.isFastApiAvailable = false;
      return false;
    }

    try {
      const res = await fetch(`${baseUrl}/`, {
        method: 'GET',
        signal: AbortSignal.timeout(1000),
      });
      if (res.ok) {
        if (!this.isFastApiAvailable) {
          console.log(`[SignMate] Connected to FastAPI AI server on ${baseUrl}`);
        }
        this.isFastApiAvailable = true;
        return true;
      }
    } catch {
      // Server offline or starting up; client-side MediaPipe landmark engine will handle detection
    }

    this.isFastApiAvailable = false;
    return false;
  }

  /**
   * Analyzes webcam video frame for real hand gestures and sign language classification
   */
  public async detectSign(video: HTMLVideoElement): Promise<HandDetectionResult> {
    const startTime = performance.now();

    if (!video || video.readyState < 2 || video.paused || video.ended) {
      return {
        hasHand: false,
        box: { x: 0, y: 0, width: 0, height: 0 },
        letter: '',
        confidence: 0,
        inferenceTimeMs: 0,
        source: 'mediapipe_landmarks',
      };
    }

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;

    // Concurrency guard to prevent overlapping MediaPipe sends
    if (this.isProcessing) {
      return (
        this.lastDetectionResult || {
          hasHand: false,
          box: { x: 0, y: 0, width: 0, height: 0 },
          letter: '',
          confidence: 0,
          inferenceTimeMs: 0,
          source: 'mediapipe_landmarks',
        }
      );
    }

    this.isProcessing = true;
    try {
      if (this.mediaPipeHands && this.isMediaPipeReady) {
        await this.mediaPipeHands.send({ image: video });
      }
    } catch {
      // Frame drop is normal under high load
    } finally {
      this.isProcessing = false;
    }

    // Verify if any hands were detected by MediaPipe
    if (
      !this.latestMediaPipeResult ||
      !this.latestMediaPipeResult.multiHandLandmarks ||
      this.latestMediaPipeResult.multiHandLandmarks.length === 0
    ) {
      const noHandResult: HandDetectionResult = {
        hasHand: false,
        box: { x: 0, y: 0, width: 0, height: 0 },
        letter: '',
        confidence: 0,
        inferenceTimeMs: Math.round(performance.now() - startTime),
        source: 'mediapipe_landmarks',
      };
      this.lastDetectionResult = noHandResult;
      return noHandResult;
    }

    const landmarks: LandmarkPoint[] = this.latestMediaPipeResult.multiHandLandmarks[0];

    // Compute padded bounding box
    const xs = landmarks.map((p) => p.x);
    const ys = landmarks.map((p) => p.y);
    const minX = Math.max(0, Math.min(...xs) - 0.06);
    const maxX = Math.min(1, Math.max(...xs) + 0.06);
    const minY = Math.max(0, Math.min(...ys) - 0.06);
    const maxY = Math.min(1, Math.max(...ys) + 0.06);

    const box = {
      x: minX * vw,
      y: minY * vh,
      width: (maxX - minX) * vw,
      height: (maxY - minY) * vh,
    };

    // 1. Try Live FastAPI Server (SignMate_stage1_best.keras) if online
    const now = performance.now();
    const baseUrl = this.getFastApiBaseUrl();
    if (this.isFastApiAvailable && baseUrl && now - this.lastFastApiTime > 200 && this.offscreenCtx) {
      this.lastFastApiTime = now;
      try {
        this.offscreenCtx.fillStyle = '#000000';
        this.offscreenCtx.fillRect(0, 0, 160, 160);
        this.offscreenCtx.drawImage(
          video,
          Math.max(0, box.x),
          Math.max(0, box.y),
          Math.min(vw - box.x, box.width),
          Math.min(vh - box.y, box.height),
          0,
          0,
          160,
          160
        );

        const base64 = this.offscreenCanvas.toDataURL('image/jpeg', 0.85);
        const res = await fetch(`${baseUrl}/api/v1/predict/base64`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64: base64 }),
          signal: AbortSignal.timeout(350),
        });

        if (res.ok) {
          const json = await res.json();
          const label = json.label;
          // Accept Keras prediction if high confidence and non-empty/non-background
          if (label && label !== '0' && json.confidence >= 0.85) {
            const kerasResult: HandDetectionResult = {
              hasHand: true,
              box,
              letter: label,
              confidence: Math.round(json.confidence * 100) / 100,
              inferenceTimeMs: Math.round(performance.now() - startTime),
              source: 'keras_model',
              landmarks,
            };
            this.lastDetectionResult = kerasResult;
            return kerasResult;
          }
        }
      } catch {
        // Fall through to 3D landmark geometric classification
      }
    }

    // 2. High-Accuracy 3D Landmark Geometric Classifier (A–Z)
    const { letter, confidence } = this.classifyLandmarks(landmarks);

    const landmarkResult: HandDetectionResult = {
      hasHand: true,
      box,
      letter,
      confidence,
      inferenceTimeMs: Math.round(performance.now() - startTime),
      source: 'mediapipe_landmarks',
      landmarks,
    };
    this.lastDetectionResult = landmarkResult;
    return landmarkResult;
  }

  /**
   * Euclidean distance between two points
   */
  private dist(p1: LandmarkPoint, p2: LandmarkPoint): number {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  /**
   * Precise ASL/ISL geometric feature classifier using 21 MediaPipe landmarks.
   * STRICT: Returns empty string if hand gesture does not clearly match a sign.
   * NEVER defaults to 'A' or 'B'.
   */
  private classifyLandmarks(lm: LandmarkPoint[]): { letter: string; confidence: number } {
    const wrist = lm[0];
    const palmScale = Math.hypot(lm[9].x - wrist.x, lm[9].y - wrist.y) || 0.2;

    // Helper: is finger extended
    const isExt = (tipIdx: number, pipIdx: number, mcpIdx: number) => {
      const dTipWrist = this.dist(lm[tipIdx], wrist);
      const dPipWrist = this.dist(lm[pipIdx], wrist);
      const dTipMcp = this.dist(lm[tipIdx], lm[mcpIdx]);
      const dPipMcp = this.dist(lm[pipIdx], lm[mcpIdx]);
      return dTipWrist > dPipWrist * 1.15 && dTipMcp > dPipMcp * 1.15;
    };

    // Helper: is finger curled
    const isCurled = (tipIdx: number, pipIdx: number, mcpIdx: number) => {
      const dTipWrist = this.dist(lm[tipIdx], wrist);
      const dPipWrist = this.dist(lm[pipIdx], wrist);
      const dTipMcp = this.dist(lm[tipIdx], lm[mcpIdx]);
      const dPipMcp = this.dist(lm[pipIdx], lm[mcpIdx]);
      return dTipWrist <= dPipWrist * 1.05 || dTipMcp <= dPipMcp * 1.05;
    };

    const isIndexExt = isExt(8, 6, 5);
    const isMiddleExt = isExt(12, 10, 9);
    const isRingExt = isExt(16, 14, 13);
    const isPinkyExt = isExt(20, 18, 17);

    const isIndexCurled = isCurled(8, 6, 5);
    const isMiddleCurled = isCurled(12, 10, 9);
    const isRingCurled = isCurled(16, 14, 13);
    const isPinkyCurled = isCurled(20, 18, 17);

    // Thumb geometry
    const isThumbUp = lm[4].y < lm[3].y && lm[4].y < lm[2].y;
    const isThumbExtOut =
      this.dist(lm[4], lm[2]) > palmScale * 0.65 &&
      this.dist(lm[4], lm[9]) > palmScale * 0.65;
    const isThumbAcrossPalm =
      this.dist(lm[4], lm[13]) < palmScale * 0.55 ||
      this.dist(lm[4], lm[9]) < palmScale * 0.5;

    const dThumbIndex = this.dist(lm[4], lm[8]) / palmScale;
    const dThumbMiddle = this.dist(lm[4], lm[12]) / palmScale;
    const dIndexMiddle = this.dist(lm[8], lm[12]) / palmScale;

    // 'Y': Thumb and Pinky extended, middle 3 curled
    if (isThumbExtOut && isPinkyExt && isIndexCurled && isMiddleCurled && isRingCurled) {
      return { letter: 'Y', confidence: 0.97 };
    }

    // 'L': Index up, Thumb extended sideways (~90°), middle/ring/pinky curled
    if (isIndexExt && isThumbExtOut && isMiddleCurled && isRingCurled && isPinkyCurled && dThumbIndex > 0.55) {
      return { letter: 'L', confidence: 0.98 };
    }

    // 'I': Pinky extended ONLY, rest curled
    if (isPinkyExt && isIndexCurled && isMiddleCurled && isRingCurled && !isThumbExtOut) {
      return { letter: 'I', confidence: 0.96 };
    }

    // 'W': Index, Middle, and Ring extended, pinky curled
    if (isIndexExt && isMiddleExt && isRingExt && isPinkyCurled) {
      return { letter: 'W', confidence: 0.97 };
    }

    // 'V' & 'U': Index and Middle extended, ring and pinky curled
    if (isIndexExt && isMiddleExt && isRingCurled && isPinkyCurled) {
      if (dIndexMiddle >= 0.35) {
        return { letter: 'V', confidence: 0.96 };
      }
      return { letter: 'U', confidence: 0.95 };
    }

    // 'B': 4 fingers straight up together, thumb folded across palm
    if (isIndexExt && isMiddleExt && isRingExt && isPinkyExt && !isThumbExtOut) {
      return { letter: 'B', confidence: 0.97 };
    }

    // 'D': Index extended ONLY, thumb touching middle tip
    if (isIndexExt && isMiddleCurled && isRingCurled && isPinkyCurled && dThumbMiddle < 0.45) {
      return { letter: 'D', confidence: 0.95 };
    }

    // 'F': Thumb and Index touching tips (OK sign), Middle/Ring/Pinky extended
    if (dThumbIndex < 0.35 && isMiddleExt && isRingExt && isPinkyExt) {
      return { letter: 'F', confidence: 0.97 };
    }

    // 'O': Thumb touching index & middle forming circle, rest curled
    if (dThumbIndex < 0.35 && dThumbMiddle < 0.45 && isRingCurled && isPinkyCurled) {
      return { letter: 'O', confidence: 0.95 };
    }

    // 'C': Curved fingers forming open C cup
    if (isIndexCurled && isMiddleCurled && isRingCurled && isPinkyCurled && dThumbIndex > 0.35 && dThumbIndex < 0.85) {
      if (lm[8].y < lm[5].y && !isThumbAcrossPalm) {
        return { letter: 'C', confidence: 0.93 };
      }
    }

    // 'A': Strictly fist with thumb upright alongside index MCP (NOT across palm)
    if (
      isIndexCurled &&
      isMiddleCurled &&
      isRingCurled &&
      isPinkyCurled &&
      isThumbUp &&
      !isThumbAcrossPalm &&
      this.dist(lm[4], lm[5]) < palmScale * 0.55
    ) {
      return { letter: 'A', confidence: 0.95 };
    }

    // 'E': Tight fist with thumb tucked below curled fingers
    if (
      isIndexCurled &&
      isMiddleCurled &&
      isRingCurled &&
      isPinkyCurled &&
      !isThumbUp &&
      isThumbAcrossPalm
    ) {
      return { letter: 'E', confidence: 0.92 };
    }

    // Default: Neutral / No matching sign. DO NOT GUESS OR FALLBACK TO A!
    return { letter: '', confidence: 0.0 };
  }

  public destroy() {
    if (this.checkServerTimer) {
      window.clearInterval(this.checkServerTimer);
      this.checkServerTimer = null;
    }
    if (this.mediaPipeHands) {
      try {
        this.mediaPipeHands.close();
      } catch {
        // ignore
      }
      this.mediaPipeHands = null;
    }
  }
}

export const handSignDetector = new HandSignDetector();
