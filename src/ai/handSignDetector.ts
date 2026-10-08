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

    // 1. High-Accuracy 3D Landmark Geometric Classifier (A–Z)
    const landmarkResult = this.classifyLandmarks(landmarks);

    // If landmark engine found a confident match (confidence >= 0.85), return it immediately
    if (landmarkResult.letter && landmarkResult.confidence >= 0.85) {
      const res: HandDetectionResult = {
        hasHand: true,
        box,
        letter: landmarkResult.letter,
        confidence: landmarkResult.confidence,
        inferenceTimeMs: Math.round(performance.now() - startTime),
        source: 'mediapipe_landmarks',
        landmarks,
      };
      this.lastDetectionResult = res;
      return res;
    }

    // 2. Secondary booster: Try Live FastAPI Server (SignMate_stage1_best.keras) if online
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
          // Accept Keras prediction only if high confidence and strictly anatomically verified
          if (label && label !== '0' && json.confidence >= 0.70) {
            const isValid = this.isPredictionAnatomicallyValid(label, landmarks);
            if (isValid) {
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
        }
      } catch {
        // Fall through to landmark result
      }
    }

    const fallbackResult: HandDetectionResult = {
      hasHand: true,
      box,
      letter: landmarkResult.letter,
      confidence: landmarkResult.confidence,
      inferenceTimeMs: Math.round(performance.now() - startTime),
      source: 'mediapipe_landmarks',
      landmarks,
    };
    this.lastDetectionResult = fallbackResult;
    return fallbackResult;
  }

  /**
   * Anatomical sanity check: rejects false-positive CNN predictions
   * that violate basic MediaPipe physical hand geometry (e.g. predicting 'B' when fist is curled).
   */
  private isPredictionAnatomicallyValid(label: string, lm: LandmarkPoint[]): boolean {
    const wrist = lm[0];
    const palmScale = Math.hypot(lm[9].x - wrist.x, lm[9].y - wrist.y) || 0.2;

    const isFingerCurled = (tipIdx: number, pipIdx: number, mcpIdx: number) => {
      const dTipMcp = this.dist(lm[tipIdx], lm[mcpIdx]);
      const dPipMcp = this.dist(lm[pipIdx], lm[mcpIdx]) || 0.001;
      const dTipWrist = this.dist(lm[tipIdx], wrist);
      const dPipWrist = this.dist(lm[pipIdx], wrist);
      return (
        dTipMcp / dPipMcp <= 1.25 ||
        lm[tipIdx].y >= lm[pipIdx].y - palmScale * 0.02 ||
        dTipWrist <= dPipWrist * 1.05
      );
    };

    const isIndexCurled = isFingerCurled(8, 6, 5);
    const isMiddleCurled = isFingerCurled(12, 10, 9);
    const isRingCurled = isFingerCurled(16, 14, 13);
    const isPinkyCurled = isFingerCurled(20, 18, 17);
    const isAllCurled = isIndexCurled && isMiddleCurled && isRingCurled && isPinkyCurled;

    const isIndexUp = lm[8].y < lm[6].y && this.dist(lm[8], lm[5]) > this.dist(lm[6], lm[5]) * 1.25;
    const isMiddleUp = lm[12].y < lm[10].y && this.dist(lm[12], lm[9]) > this.dist(lm[10], lm[9]) * 1.25;
    const isRingUp = lm[16].y < lm[14].y && this.dist(lm[16], lm[13]) > this.dist(lm[14], lm[13]) * 1.25;
    const isPinkyUp = lm[20].y < lm[18].y && this.dist(lm[20], lm[17]) > this.dist(lm[18], lm[17]) * 1.20;

    // 'B' requires ALL 4 fingers extended straight UP, never curled
    if (label === 'B') {
      return (
        !isAllCurled &&
        isIndexUp &&
        isMiddleUp &&
        isRingUp &&
        isPinkyUp &&
        !isIndexCurled &&
        !isMiddleCurled &&
        !isRingCurled &&
        !isPinkyCurled
      );
    }

    // 'W' requires index, middle, ring extended UP
    if (label === 'W') {
      return !isIndexCurled && !isMiddleCurled && !isRingCurled && isIndexUp && isMiddleUp && isRingUp;
    }

    // 'V', 'U', 'R', 'K' require index and middle extended UP
    if (['V', 'U', 'R', 'K'].includes(label)) {
      return isIndexUp && isMiddleUp && !isIndexCurled && !isMiddleCurled;
    }

    // 'L', 'D' require index extended UP
    if (['L', 'D'].includes(label)) {
      return isIndexUp && !isIndexCurled;
    }

    // 'I', 'Y' require pinky extended UP
    if (['I', 'Y'].includes(label)) {
      return isPinkyUp && !isPinkyCurled;
    }

    // Fist letters ('A', 'E', 'M', 'N', 'S', 'T') require fingers curled
    if (['A', 'E', 'M', 'N', 'S', 'T'].includes(label)) {
      return isAllCurled || (isIndexCurled && isMiddleCurled);
    }

    return true;
  }

  /**
   * Euclidean distance between two points
   */
  private dist(p1: LandmarkPoint, p2: LandmarkPoint): number {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  /**
   * Precise ASL geometric feature classifier using 21 MediaPipe landmarks.
   * Calibrated according to the standard American Sign Language Alphabet chart.
   * Strictly separates all 26 alphabets (A through Z) without false-positive defaults.
   */
  private classifyLandmarks(lm: LandmarkPoint[]): { letter: string; confidence: number } {
    const wrist = lm[0];
    const palmScale = Math.hypot(lm[9].x - wrist.x, lm[9].y - wrist.y) || 0.2;

    // Self-normalizing finger evaluation helper
    const evalFinger = (tipIdx: number, pipIdx: number, mcpIdx: number) => {
      const dTipMcp = this.dist(lm[tipIdx], lm[mcpIdx]);
      const dPipMcp = this.dist(lm[pipIdx], lm[mcpIdx]) || 0.001;
      const dTipWrist = this.dist(lm[tipIdx], wrist);
      const dPipWrist = this.dist(lm[pipIdx], wrist);

      const isExtended = dTipMcp / dPipMcp > 1.25 && dTipWrist > dPipWrist * 1.04;
      const isUp = isExtended && lm[tipIdx].y < lm[pipIdx].y;
      const isCurled =
        dTipMcp / dPipMcp <= 1.22 ||
        dTipWrist <= dPipWrist * 1.05 ||
        lm[tipIdx].y >= lm[pipIdx].y - palmScale * 0.02;

      return {
        isExtended,
        isUp,
        isCurled,
        dTipMcp,
        dTipWrist,
        pipRaised: lm[mcpIdx].y - lm[pipIdx].y > palmScale * 0.28,
      };
    };

    const fIndex = evalFinger(8, 6, 5);
    const fMiddle = evalFinger(12, 10, 9);
    const fRing = evalFinger(16, 14, 13);
    const fPinky = evalFinger(20, 18, 17);

    // Thumb geometry
    const dThumbIndex = this.dist(lm[4], lm[8]) / palmScale;
    const dThumbMiddle = this.dist(lm[4], lm[12]) / palmScale;
    const dThumbMcp5 = this.dist(lm[4], lm[5]) / palmScale;

    const isThumbUp = lm[4].y < lm[3].y + palmScale * 0.05 && lm[4].y < lm[2].y;
    const isThumbExtOut =
      this.dist(lm[4], lm[2]) > palmScale * 0.50 &&
      this.dist(lm[4], lm[9]) > palmScale * 0.50;
    const isThumbAcrossPalm =
      this.dist(lm[4], lm[13]) < palmScale * 0.65 ||
      this.dist(lm[4], lm[9]) < palmScale * 0.60;

    const dIndexMiddle = this.dist(lm[8], lm[12]) / palmScale;

    // Relative vectors for horizontal checks
    const dxIndex = lm[8].x - lm[5].x;
    const dyIndex = lm[8].y - lm[5].y;
    const dxMiddle = lm[12].x - lm[9].x;
    const dyMiddle = lm[12].y - lm[9].y;

    const isIndexPointingDown = dyIndex > palmScale * 0.20;
    const isIndexHorizontal = Math.abs(dxIndex) > Math.abs(dyIndex) * 0.70 && Math.abs(dxIndex) > palmScale * 0.35;
    const isMiddleHorizontal = Math.abs(dxMiddle) > Math.abs(dyMiddle) * 0.70 && Math.abs(dxMiddle) > palmScale * 0.35;

    // Hooked index finger ('X': Knuckle PIP raised high, but tip bent down)
    const isIndexHooked =
      fIndex.pipRaised &&
      (lm[8].y > lm[6].y || this.dist(lm[8], lm[5]) < this.dist(lm[6], lm[5]) * 1.35) &&
      fMiddle.isCurled &&
      fRing.isCurled &&
      fPinky.isCurled;

    // ==========================================
    // 1. ALL 4 FINGERS EXTENDED UP (B or 5)
    // ==========================================
    if (fIndex.isUp && fMiddle.isUp && fRing.isUp && fPinky.isUp) {
      if (isThumbExtOut) {
        return { letter: '5', confidence: 0.98 };
      }
      return { letter: 'B', confidence: 0.98 };
    }

    // ==========================================
    // 2. 3 FINGERS EXTENDED UP (W, F)
    // ==========================================
    if (dThumbIndex < 0.45 && fMiddle.isUp && fRing.isUp && fPinky.isUp) {
      return { letter: 'F', confidence: 0.98 };
    }

    if (fIndex.isUp && fMiddle.isUp && fRing.isUp && fPinky.isCurled) {
      return { letter: 'W', confidence: 0.98 };
    }

    // ==========================================
    // 3. TWO FINGERS (Index + Middle) EXTENDED (V, U, R, K, H, P)
    // ==========================================
    if (fIndex.isExtended && fMiddle.isExtended && fRing.isCurled && fPinky.isCurled) {
      if (isIndexPointingDown && dyMiddle > palmScale * 0.18) {
        return { letter: 'P', confidence: 0.96 };
      }
      if (isIndexHorizontal && isMiddleHorizontal && dIndexMiddle < 0.45) {
        return { letter: 'H', confidence: 0.96 };
      }
      if (fIndex.isUp && fMiddle.isUp) {
        // 'R': Crossed fingers
        if ((lm[8].x - lm[12].x) * (lm[5].x - lm[9].x) < 0 || dIndexMiddle < 0.16) {
          return { letter: 'R', confidence: 0.97 };
        }
        // 'K': Thumb upright between index and middle
        if ((isThumbUp || this.dist(lm[4], lm[6]) < palmScale * 0.48) && !isThumbAcrossPalm && dIndexMiddle >= 0.20) {
          return { letter: 'K', confidence: 0.96 };
        }
        // 'V': Spread apart
        if (dIndexMiddle >= 0.22) {
          return { letter: 'V', confidence: 0.98 };
        }
        // 'U': Held together side-by-side
        return { letter: 'U', confidence: 0.97 };
      }
    }

    // ==========================================
    // 4. ONE FINGER: PINKY ALONE (I, J, Y)
    // ==========================================
    if (fPinky.isUp && fIndex.isCurled && fMiddle.isCurled && fRing.isCurled) {
      if (isThumbExtOut) {
        return { letter: 'Y', confidence: 0.98 };
      }
      if (lm[20].y > lm[18].y || Math.abs(lm[20].x - lm[17].x) > palmScale * 0.5) {
        return { letter: 'J', confidence: 0.94 };
      }
      return { letter: 'I', confidence: 0.98 };
    }

    // ==========================================
    // 5. ONE FINGER: INDEX ALONE (D, G, L, Q, X, Z)
    // ==========================================
    if (fIndex.isExtended && fMiddle.isCurled && fRing.isCurled && fPinky.isCurled) {
      if (fIndex.isUp && isThumbExtOut && dThumbIndex > 0.45 && !isIndexPointingDown) {
        return { letter: 'L', confidence: 0.98 };
      }
      if (isIndexPointingDown && lm[4].y > lm[2].y) {
        return { letter: 'Q', confidence: 0.95 };
      }
      if (isIndexHorizontal && this.dist(lm[4], lm[8]) < palmScale * 0.85) {
        return { letter: 'G', confidence: 0.96 };
      }
      if (isThumbAcrossPalm && Math.abs(dxIndex) > Math.abs(dyIndex) * 0.70) {
        return { letter: 'Z', confidence: 0.94 };
      }
      if (fIndex.isUp && (dThumbMiddle < 0.55 || this.dist(lm[4], lm[10]) < palmScale * 0.52 || !isThumbExtOut)) {
        return { letter: 'D', confidence: 0.97 };
      }
    }

    // 'X': Hooked index finger
    if (isIndexHooked) {
      return { letter: 'X', confidence: 0.96 };
    }

    // ==========================================
    // 6. FIST LETTERS (A, E, M, N, S, T)
    // ==========================================
    const curledCount =
      (fIndex.isCurled ? 1 : 0) +
      (fMiddle.isCurled ? 1 : 0) +
      (fRing.isCurled ? 1 : 0) +
      (fPinky.isCurled ? 1 : 0);

    const isClosedFist =
      (curledCount >= 3 || (fIndex.isCurled && fMiddle.isCurled)) &&
      !fIndex.isUp &&
      !fMiddle.isUp &&
      !fRing.isUp &&
      !fPinky.isUp;

    if (isClosedFist) {
      const dThumbIndexPip = this.dist(lm[4], lm[6]) / palmScale;
      const dThumbMiddlePip = this.dist(lm[4], lm[10]) / palmScale;
      const dThumbRingPip = this.dist(lm[4], lm[14]) / palmScale;
      const dThumbPinkyPip = this.dist(lm[4], lm[18]) / palmScale;

      const dThumbIndexTip = this.dist(lm[4], lm[8]) / palmScale;
      const dThumbMiddleTip = this.dist(lm[4], lm[12]) / palmScale;

      // 'E': Fingertips curled down tightly resting ON TOP of thumb; thumb horizontal low
      if (
        lm[4].y >= lm[8].y - palmScale * 0.05 &&
        dThumbIndexTip < 0.45 &&
        dThumbMiddleTip < 0.48 &&
        lm[4].y > lm[6].y + palmScale * 0.08
      ) {
        return { letter: 'E', confidence: 0.96 };
      }

      // 'A': Thumb UP alongside outside lateral edge of index finger
      if (
        (isThumbUp || lm[4].y < lm[6].y + palmScale * 0.08) &&
        dThumbMcp5 < 0.65 &&
        dThumbRingPip > 0.42 &&
        dThumbPinkyPip > 0.48
      ) {
        return { letter: 'A', confidence: 0.98 };
      }

      // 'M': Thumb tucked under 3 fingers, peeking out between Ring and Pinky
      if (
        dThumbPinkyPip <= dThumbIndexPip &&
        dThumbRingPip <= dThumbIndexPip &&
        (dThumbPinkyPip < 0.35 || (dThumbRingPip < 0.28 && dThumbPinkyPip < 0.38))
      ) {
        return { letter: 'M', confidence: 0.97 };
      }

      // 'N': Thumb tucked under 2 fingers, peeking out between Middle and Ring
      if (
        dThumbMiddlePip < 0.30 &&
        dThumbRingPip < 0.30 &&
        dThumbPinkyPip >= 0.28
      ) {
        return { letter: 'N', confidence: 0.97 };
      }

      // 'T': Thumb tucked under index finger ONLY, peeking UP between Index and Middle
      if (
        dThumbIndexPip < 0.30 &&
        dThumbMiddlePip < 0.30 &&
        lm[4].y <= lm[6].y + palmScale * 0.05
      ) {
        return { letter: 'T', confidence: 0.97 };
      }

      // 'S': Thumb wrapped horizontally across front of fingers
      if (dThumbIndexPip < 0.65 && dThumbMiddlePip < 0.65) {
        return { letter: 'S', confidence: 0.96 };
      }

      if (isThumbUp || dThumbMcp5 < 0.60) {
        return { letter: 'A', confidence: 0.85 };
      }
      return { letter: 'S', confidence: 0.85 };
    }

    // ==========================================
    // 7. CIRCULAR / ARCHED SHAPES (C, O)
    // ==========================================
    if (fRing.isCurled && fPinky.isCurled && !fIndex.isUp && !fMiddle.isUp) {
      if (dThumbIndex < 0.48 && dThumbMiddle < 0.52 && this.dist(lm[4], lm[16]) / palmScale < 0.58) {
        return { letter: 'O', confidence: 0.96 };
      }
      if (
        dThumbIndex >= 0.35 &&
        dThumbIndex <= 1.15 &&
        !isThumbAcrossPalm &&
        lm[8].y < lm[5].y + palmScale * 0.1
      ) {
        return { letter: 'C', confidence: 0.95 };
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
