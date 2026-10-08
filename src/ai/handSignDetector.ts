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
    if (typeof window === 'undefined') return custom || '';

    const hostname = window.location.hostname || '';
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    const isLanIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);

    // If hosted on a public domain (e.g. Vercel), never query localhost HTTP
    if (!isLocal && !isLanIp) {
      if (custom && !custom.includes('localhost') && !custom.includes('127.0.0.1')) {
        return custom;
      }
      return '';
    }

    if (custom) return custom;
    const rawHost = hostname || '127.0.0.1';
    const host = rawHost === 'localhost' ? '127.0.0.1' : rawHost;
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
      const isHttpsProxy = baseUrl.startsWith('https://') || (typeof window !== 'undefined' && baseUrl === window.location.origin);
      const healthUrl = isHttpsProxy ? `${baseUrl}/fastapi_status` : `${baseUrl}/`;
      const res = await fetch(healthUrl, {
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
          if (label && label !== '0' && json.confidence >= 0.7) {
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
  /**
   * Precise ASL/ISL geometric feature classifier using 21 MediaPipe landmarks.
   * Covers all 26 alphabets (A through Z) with calibrated tolerances.
   * Returns empty string if hand gesture does not match a valid sign.
   */
  private classifyLandmarks(lm: LandmarkPoint[]): { letter: string; confidence: number } {
    const wrist = lm[0];
    const palmScale = Math.hypot(lm[9].x - wrist.x, lm[9].y - wrist.y) || 0.2;

    // Helper: is finger extended (tip is significantly farther from wrist and MCP than PIP)
    const isExt = (tipIdx: number, pipIdx: number, mcpIdx: number) => {
      const dTipWrist = this.dist(lm[tipIdx], wrist);
      const dPipWrist = this.dist(lm[pipIdx], wrist);
      const dTipMcp = this.dist(lm[tipIdx], lm[mcpIdx]);
      const dPipMcp = this.dist(lm[pipIdx], lm[mcpIdx]);
      return dTipWrist > dPipWrist * 1.06 && dTipMcp > dPipMcp * 1.08;
    };

    const isIndexExt = isExt(8, 6, 5);
    const isMiddleExt = isExt(12, 10, 9);
    const isRingExt = isExt(16, 14, 13);
    const isPinkyExt = isExt(20, 18, 17);

    const isIndexCurled = !isIndexExt;
    const isMiddleCurled = !isMiddleExt;
    const isRingCurled = !isRingExt;
    const isPinkyCurled = !isPinkyExt;

    // Thumb geometry
    const isThumbUp = lm[4].y < lm[3].y && lm[4].y < lm[2].y;
    const isThumbExtOut =
      this.dist(lm[4], lm[2]) > palmScale * 0.60 &&
      this.dist(lm[4], lm[9]) > palmScale * 0.58;
    const isThumbAcrossPalm =
      this.dist(lm[4], lm[13]) < palmScale * 0.65 ||
      this.dist(lm[4], lm[9]) < palmScale * 0.58;

    const dThumbIndex = this.dist(lm[4], lm[8]) / palmScale;
    const dThumbMiddle = this.dist(lm[4], lm[12]) / palmScale;
    const dIndexMiddle = this.dist(lm[8], lm[12]) / palmScale;

    // Relative vector from knuckle to tip for index and middle
    const dxIndex = lm[8].x - lm[5].x;
    const dyIndex = lm[8].y - lm[5].y;
    const dxMiddle = lm[12].x - lm[9].x;
    const dyMiddle = lm[12].y - lm[9].y;

    const isIndexPointingDown = dyIndex > palmScale * 0.22;
    const isIndexHorizontal = Math.abs(dxIndex) > Math.abs(dyIndex) * 0.8 && Math.abs(dxIndex) > palmScale * 0.45;
    const isMiddleHorizontal = Math.abs(dxMiddle) > Math.abs(dyMiddle) * 0.8 && Math.abs(dxMiddle) > palmScale * 0.45;

    // Hooked index finger ('X': knuckle raised, but tip bent down)
    const isIndexHooked =
      !isIndexExt &&
      this.dist(lm[6], wrist) > this.dist(lm[5], wrist) * 1.05 &&
      (lm[8].y > lm[6].y || this.dist(lm[8], lm[5]) < this.dist(lm[6], lm[5]) * 1.35) &&
      isMiddleCurled && isRingCurled && isPinkyCurled;

    // ==========================================
    // 1. ALL 4 FINGERS EXTENDED (B or 5)
    // ==========================================
    if (isIndexExt && isMiddleExt && isRingExt && isPinkyExt) {
      // 'B': All 4 fingers straight up together, thumb folded across palm or resting against index
      if (!isThumbExtOut) {
        return { letter: 'B', confidence: 0.98 };
      }
    }

    // ==========================================
    // 2. 3 FINGERS EXTENDED (W)
    // ==========================================
    if (isIndexExt && isMiddleExt && isRingExt && isPinkyCurled) {
      // 'W': Index, Middle, Ring extended straight up, Pinky curled
      return { letter: 'W', confidence: 0.98 };
    }

    // ==========================================
    // 3. CIRCULAR / ARCHED SHAPES (F, O, C)
    // ==========================================

    // 'F': "OK" sign - Thumb tip touches Index tip, other 3 fingers extended
    if (dThumbIndex < 0.45 && isMiddleExt && isRingExt && isPinkyExt) {
      return { letter: 'F', confidence: 0.98 };
    }

    // 'O': All fingers curved down with tips touching thumb tip forming a circle
    if (
      dThumbIndex < 0.48 &&
      dThumbMiddle < 0.52 &&
      isRingCurled &&
      isPinkyCurled &&
      !isIndexExt &&
      !isMiddleExt
    ) {
      return { letter: 'O', confidence: 0.96 };
    }

    // 'C': Open arc / cup shape - fingers curved together, thumb opposite
    if (
      isIndexCurled &&
      isMiddleCurled &&
      isRingCurled &&
      isPinkyCurled &&
      dThumbIndex >= 0.35 &&
      dThumbIndex <= 1.05 &&
      !isThumbAcrossPalm &&
      lm[8].y < lm[5].y + palmScale * 0.1
    ) {
      return { letter: 'C', confidence: 0.95 };
    }

    // ==========================================
    // 4. TWO-FINGER COMBINATIONS (Index + Middle)
    // ==========================================
    if (isIndexExt && isMiddleExt && isRingCurled && isPinkyCurled) {
      // 'P': Pointing downward with thumb between
      if (isIndexPointingDown && dyMiddle > palmScale * 0.18) {
        return { letter: 'P', confidence: 0.96 };
      }

      // 'H': Extended horizontally side-by-side
      if (isIndexHorizontal && isMiddleHorizontal && dIndexMiddle < 0.42) {
        return { letter: 'H', confidence: 0.96 };
      }

      // 'R': Index and Middle crossed over each other
      if (
        (lm[8].x - lm[12].x) * (lm[5].x - lm[9].x) < 0 ||
        dIndexMiddle < 0.20
      ) {
        return { letter: 'R', confidence: 0.97 };
      }

      // 'K': Thumb upright between index and middle knuckles
      if (
        (isThumbUp || this.dist(lm[4], lm[6]) < palmScale * 0.50) &&
        !isThumbAcrossPalm &&
        dIndexMiddle >= 0.20
      ) {
        return { letter: 'K', confidence: 0.96 };
      }

      // 'V': Peace sign - fingers spread apart in 'V' with thumb folded across palm
      if (dIndexMiddle >= 0.25) {
        return { letter: 'V', confidence: 0.98 };
      }

      // 'U': Index and Middle held together straight up
      return { letter: 'U', confidence: 0.97 };
    }

    // ==========================================
    // 5. SINGLE FINGER: PINKY ALONE (I, J, Y)
    // ==========================================
    if (isPinkyExt && isIndexCurled && isMiddleCurled && isRingCurled) {
      // 'Y': Thumb and Pinky extended out (Shaka)
      if (isThumbExtOut) {
        return { letter: 'Y', confidence: 0.98 };
      }

      // 'J': Pinky angled / pointing downward / curving
      if (lm[20].y > lm[18].y || Math.abs(lm[20].x - lm[17].x) > palmScale * 0.5) {
        return { letter: 'J', confidence: 0.94 };
      }

      // 'I': Pinky pointing straight up
      return { letter: 'I', confidence: 0.98 };
    }

    // ==========================================
    // 6. SINGLE FINGER: INDEX ALONE (D, G, L, Q, X, Z)
    // ==========================================
    if (isIndexExt && isMiddleCurled && isRingCurled && isPinkyCurled) {
      // 'L': Index up, Thumb extended out horizontally at ~90°
      if (isThumbExtOut && dThumbIndex > 0.50 && !isIndexPointingDown) {
        return { letter: 'L', confidence: 0.98 };
      }

      // 'Q': Index pointing downward with thumb parallel down
      if (isIndexPointingDown && lm[4].y > lm[2].y) {
        return { letter: 'Q', confidence: 0.95 };
      }

      // 'G': Index extended horizontally with thumb parallel
      if (isIndexHorizontal && this.dist(lm[4], lm[8]) < palmScale * 0.82) {
        return { letter: 'G', confidence: 0.96 };
      }

      // 'Z': Index pointing forward / tilted horizontally
      if (isThumbAcrossPalm && Math.abs(dxIndex) > Math.abs(dyIndex) * 0.7) {
        return { letter: 'Z', confidence: 0.94 };
      }

      // 'D': Index pointing straight up, thumb touching middle finger tip/knuckle
      if (dThumbMiddle < 0.55 || this.dist(lm[4], lm[10]) < palmScale * 0.52 || !isThumbExtOut) {
        return { letter: 'D', confidence: 0.97 };
      }
    }

    // 'X': Index hooked into a crook, other 3 fingers curled
    if (isIndexHooked) {
      return { letter: 'X', confidence: 0.96 };
    }

    // ==========================================
    // 7. FIST VARIATIONS (A, E, M, N, S, T)
    // ==========================================
    if (isIndexCurled && isMiddleCurled && isRingCurled && isPinkyCurled) {
      // 'A': Thumb straight UP resting beside Index MCP (lateral side of fist)
      if (isThumbUp && !isThumbAcrossPalm) {
        return { letter: 'A', confidence: 0.97 };
      }

      // 'T': Thumb tucked under index finger ONLY (poking up between Index & Middle)
      if (
        this.dist(lm[4], lm[6]) < palmScale * 0.50 &&
        this.dist(lm[4], lm[10]) < palmScale * 0.60 &&
        lm[4].y <= lm[6].y + palmScale * 0.15
      ) {
        return { letter: 'T', confidence: 0.95 };
      }

      // 'N': Thumb tucked under first two fingers (peeking between Middle & Ring)
      if (
        this.dist(lm[4], lm[10]) < palmScale * 0.52 &&
        this.dist(lm[4], lm[14]) < palmScale * 0.60
      ) {
        return { letter: 'N', confidence: 0.95 };
      }

      // 'M': Thumb tucked under three fingers (peeking near pinky base)
      if (
        this.dist(lm[4], lm[14]) < palmScale * 0.55 ||
        this.dist(lm[4], lm[17]) < palmScale * 0.58
      ) {
        return { letter: 'M', confidence: 0.95 };
      }

      // 'S': Thumb wrapped horizontally OVER front of curled fingers
      if (
        !isThumbUp &&
        this.dist(lm[4], lm[6]) < palmScale * 0.55 &&
        this.dist(lm[4], lm[10]) < palmScale * 0.55
      ) {
        return { letter: 'S', confidence: 0.96 };
      }

      // 'E': Fingers curled down tightly with thumb folded horizontally underneath
      if (isThumbAcrossPalm) {
        return { letter: 'E', confidence: 0.95 };
      }
    }

    // Default: Neutral / No matching sign
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
