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
  topPredictions?: Array<{ label: string; confidence: number }>;
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
  private activeApiUrl = '';

  constructor() {
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = 160;
    this.offscreenCanvas.height = 160;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });

    this.initMediaPipe();
    this.checkFastApiHealth();

    // Check FastAPI health with timer if running locally
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
            modelComplexity: 0,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
            selfieMode: true,
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
    const urlsToTry: string[] = ['/api/v1/health'];
    const baseUrl = this.getFastApiBaseUrl();
    if (baseUrl) {
      urlsToTry.push(`${baseUrl}/api/v1/health`, `${baseUrl}/fastapi_status`, `${baseUrl}/`);
    }

    for (const testUrl of urlsToTry) {
      try {
        const res = await fetch(testUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(1200),
        });
        if (res.ok) {
          if (!this.isFastApiAvailable) {
            console.log(`[SignMate] Connected to FastAPI AI server via ${testUrl}`);
          }
          this.isFastApiAvailable = true;
          this.activeApiUrl = testUrl.startsWith('/') ? '' : baseUrl;
          return true;
        }
      } catch {
        // try next endpoint
      }
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

    // Compute natural 1:1 square centered bounding box around the hand with zero distortion
    const xs = landmarks.map((p) => p.x);
    const ys = landmarks.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const cx = ((minX + maxX) / 2) * vw;
    const cy = ((minY + maxY) / 2) * vh;
    const handWidth = (maxX - minX) * vw;
    const handHeight = (maxY - minY) * vh;
    const handSpan = Math.max(handWidth, handHeight);

    const maxSide = Math.min(vw, vh);
    const cropSize = Math.min(maxSide, Math.max(140, handSpan * 1.45));
    const halfCrop = cropSize / 2;
    const srcX = Math.max(0, Math.min(vw - cropSize, cx - halfCrop));
    const srcY = Math.max(0, Math.min(vh - cropSize, cy - halfCrop));
    const srcW = cropSize;
    const srcH = cropSize;

    const box = {
      x: Math.max(0, (minX - 0.04) * vw),
      y: Math.max(0, (minY - 0.04) * vh),
      width: Math.min(vw, (maxX - minX + 0.08) * vw),
      height: Math.min(vh, (maxY - minY + 0.08) * vh),
    };

    // 1. Compute 3D Landmark Geometric Classification (A–Z)
    const landmarkResult = this.classifyLandmarks(landmarks);

    // 2. Query Live Keras AI Model (SignMate_stage1_best.keras via FastAPI) when online
    const now = performance.now();
    const endpoint = this.activeApiUrl ? `${this.activeApiUrl}/api/v1/predict/base64` : '/api/v1/predict/base64';

    if (this.isFastApiAvailable && now - this.lastFastApiTime > 150 && this.offscreenCtx) {
      this.lastFastApiTime = now;
      try {
        this.offscreenCtx.fillStyle = '#000000';
        this.offscreenCtx.fillRect(0, 0, 160, 160);
        this.offscreenCtx.drawImage(
          video,
          srcX,
          srcY,
          srcW,
          srcH,
          0,
          0,
          160,
          160
        );

        const base64 = this.offscreenCanvas.toDataURL('image/jpeg', 0.85);
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64: base64 }),
          signal: AbortSignal.timeout(600),
        });

        if (res.ok) {
          const json = await res.json();
          const rawLabel: string = String(json.label || '').toUpperCase().trim();
          const modelLabel: string = /^[A-Z]$/.test(rawLabel) ? rawLabel : '';
          const modelConf: number = typeof json.confidence === 'number' ? json.confidence : 0;
          const topPredictions: Array<{ label: string; confidence: number }> = Array.isArray(json.top_predictions)
            ? json.top_predictions
            : [];

          // Guard against wide open palm falsely triggering signs
          const isPalmOpen = this.isOpenPalm(landmarks);
          if (isPalmOpen) {
            const neutralResult: HandDetectionResult = {
              hasHand: true,
              box,
              letter: '',
              confidence: 0,
              inferenceTimeMs: Math.round(performance.now() - startTime),
              source: 'mediapipe_landmarks',
              landmarks,
              topPredictions,
            };
            this.lastDetectionResult = neutralResult;
            return neutralResult;
          }

          // Case A: Agreement between Neural Network and 3D Landmarks -> Maximum confidence boost
          if (modelLabel && landmarkResult.letter && modelLabel === landmarkResult.letter) {
            const agreedResult: HandDetectionResult = {
              hasHand: true,
              box,
              letter: modelLabel,
              confidence: 0.99,
              inferenceTimeMs: Math.round(performance.now() - startTime),
              source: 'keras_model',
              landmarks,
              topPredictions,
            };
            this.lastDetectionResult = agreedResult;
            return agreedResult;
          }

          // Case B: Neural Network prediction has high confidence (>= 0.65) and satisfies physical hand geometry
          if (modelLabel && modelConf >= 0.65 && this.isPredictionAnatomicallyValid(modelLabel, landmarks)) {
            const modelResult: HandDetectionResult = {
              hasHand: true,
              box,
              letter: modelLabel,
              confidence: Math.round(modelConf * 100) / 100,
              inferenceTimeMs: Math.round(performance.now() - startTime),
              source: 'keras_model',
              landmarks,
              topPredictions,
            };
            this.lastDetectionResult = modelResult;
            return modelResult;
          }

          // Case C: Landmark Engine recognized a definitive ASL gesture
          if (landmarkResult.letter && landmarkResult.confidence >= 0.80) {
            const landmarkOut: HandDetectionResult = {
              hasHand: true,
              box,
              letter: landmarkResult.letter,
              confidence: landmarkResult.confidence,
              inferenceTimeMs: Math.round(performance.now() - startTime),
              source: 'mediapipe_landmarks',
              landmarks,
              topPredictions,
            };
            this.lastDetectionResult = landmarkOut;
            return landmarkOut;
          }

          // Case D: Moderate confidence Neural Network prediction (>= 0.50) with anatomical validity
          if (modelLabel && modelConf >= 0.50 && this.isPredictionAnatomicallyValid(modelLabel, landmarks)) {
            const modelResult: HandDetectionResult = {
              hasHand: true,
              box,
              letter: modelLabel,
              confidence: Math.round(modelConf * 100) / 100,
              inferenceTimeMs: Math.round(performance.now() - startTime),
              source: 'keras_model',
              landmarks,
              topPredictions,
            };
            this.lastDetectionResult = modelResult;
            return modelResult;
          }
        }
      } catch {
        // Fall through to landmark result
      }
    }

    // Local / Offline Fallback: Use safe landmark letter (only single uppercase A-Z; never digits or neutral)
    const isPalmOpen = this.isOpenPalm(landmarks);
    const safeLandmarkLetter = !isPalmOpen && /^[A-Z]$/.test(landmarkResult.letter) ? landmarkResult.letter : '';

    const fallbackResult: HandDetectionResult = {
      hasHand: true,
      box,
      letter: safeLandmarkLetter,
      confidence: safeLandmarkLetter ? landmarkResult.confidence : 0,
      inferenceTimeMs: Math.round(performance.now() - startTime),
      source: 'mediapipe_landmarks',
      landmarks,
    };
    this.lastDetectionResult = fallbackResult;
    return fallbackResult;
  }

  /**
   * Straightness metric for a finger:
   * Direct knuckle-to-tip distance divided by cumulative bone segments.
   * Straight finger: ~0.85 - 1.0
   * Curved C-arc / O-arc: ~0.48 - 0.85
   * Curled fist: < 0.70
   */
  private getStraightness(lm: LandmarkPoint[], tip: number, dip: number, pip: number, mcp: number): number {
    const direct = this.dist(lm[tip], lm[mcp]);
    const segs = this.dist(lm[mcp], lm[pip]) + this.dist(lm[pip], lm[dip]) + this.dist(lm[dip], lm[tip]);
    return segs > 0 ? direct / segs : 0;
  }

  /**
   * Identifies a wide open relaxed palm / wave to ensure it stays neutral
   */
  private isOpenPalm(lm: LandmarkPoint[]): boolean {
    const wrist = lm[0];
    const palmScale = Math.hypot(lm[9].x - wrist.x, lm[9].y - wrist.y) || 0.2;

    const sIndex = this.getStraightness(lm, 8, 7, 6, 5);
    const sMiddle = this.getStraightness(lm, 12, 11, 10, 9);
    const sRing = this.getStraightness(lm, 16, 15, 14, 13);
    const sPinky = this.getStraightness(lm, 20, 19, 18, 17);

    const areFourExtended = sIndex >= 0.80 && sMiddle >= 0.80 && sRing >= 0.78 && sPinky >= 0.76;
    if (!areFourExtended) return false;

    const dIndexMiddle = this.dist(lm[8], lm[12]) / palmScale;
    const dMiddleRing = this.dist(lm[12], lm[16]) / palmScale;
    const dRingPinky = this.dist(lm[16], lm[20]) / palmScale;
    const areFingersSpread = dIndexMiddle > 0.25 || dMiddleRing > 0.25 || dRingPinky > 0.25;

    const isThumbExtOut =
      this.dist(lm[4], lm[2]) > palmScale * 0.45 &&
      this.dist(lm[4], lm[9]) > palmScale * 0.45;

    // If 4 fingers are extended and spread out, or thumb is open outward -> Open palm neutral
    return areFingersSpread || isThumbExtOut;
  }

  /**
   * Anatomical sanity check: verifies whether a candidate prediction letter
   * is physically compatible with the detected 3D hand landmarks.
   * Covers all 26 uppercase letters (A-Z) without false-positive lockouts.
   */
  private isPredictionAnatomicallyValid(label: string, lm: LandmarkPoint[]): boolean {
    if (!/^[A-Z]$/.test(label)) return false;

    const wrist = lm[0];
    const palmScale = Math.hypot(lm[9].x - wrist.x, lm[9].y - wrist.y) || 0.2;

    const sIndex = this.getStraightness(lm, 8, 7, 6, 5);
    const sMiddle = this.getStraightness(lm, 12, 11, 10, 9);
    const sRing = this.getStraightness(lm, 16, 15, 14, 13);
    const sPinky = this.getStraightness(lm, 20, 19, 18, 17);

    const dThumbIndex = this.dist(lm[4], lm[8]) / palmScale;
    const dThumbMiddle = this.dist(lm[4], lm[12]) / palmScale;
    const dIndexMiddle = this.dist(lm[8], lm[12]) / palmScale;
    const dMiddleRing = this.dist(lm[12], lm[16]) / palmScale;
    const dRingPinky = this.dist(lm[16], lm[20]) / palmScale;

    const areFourExtended = sIndex >= 0.80 && sMiddle >= 0.80 && sRing >= 0.78 && sPinky >= 0.76;

    // 'B' requires all 4 fingers extended straight UP, held together, thumb folded across palm
    if (label === 'B') {
      const areFourTogether = dIndexMiddle <= 0.25 && dMiddleRing <= 0.25 && dRingPinky <= 0.25;
      const isThumbTucked = this.dist(lm[4], lm[13]) < palmScale * 0.55 || this.dist(lm[4], lm[9]) < palmScale * 0.55;
      return areFourExtended && areFourTogether && isThumbTucked;
    }

    // Open palm cannot be any other letter
    if (areFourExtended) {
      return false;
    }

    // 'C' requires open curved gap between thumb and arched fingers (not straight, not a fist)
    if (label === 'C') {
      const areCurved = sIndex <= 0.88 && sIndex >= 0.40 && sMiddle <= 0.88 && sMiddle >= 0.40;
      const isGap = dThumbIndex >= 0.25 && dThumbIndex <= 1.40;
      const isThumbNotPressed = this.dist(lm[4], lm[9]) > palmScale * 0.30;
      return areCurved && isGap && isThumbNotPressed;
    }

    // 'O' requires closed circle between thumb and fingertips
    if (label === 'O') {
      return (
        dThumbIndex < 0.45 &&
        (dThumbMiddle < 0.52 || dIndexMiddle < 0.42) &&
        sIndex < 0.90 &&
        sMiddle < 0.90
      );
    }

    // 'W' requires index, middle, ring straight, pinky curled
    if (label === 'W') {
      return sIndex >= 0.78 && sMiddle >= 0.78 && sRing >= 0.78 && sPinky < 0.82;
    }

    // 'F' requires thumb touching index, other 3 fingers upright
    if (label === 'F') {
      return dThumbIndex < 0.48 && sMiddle >= 0.78 && sRing >= 0.78 && sPinky >= 0.76;
    }

    // 'V', 'U', 'R', 'K', 'H', 'P' require index and middle extended, ring and pinky curled
    if (['V', 'U', 'R', 'K', 'H', 'P'].includes(label)) {
      return sIndex >= 0.78 && sMiddle >= 0.78 && sRing < 0.82 && sPinky < 0.82;
    }

    // 'L', 'D', 'G', 'Q', 'X', 'Z' require index extended or hooked, middle and ring curled
    if (['L', 'D', 'G', 'Q', 'X', 'Z'].includes(label)) {
      return (sIndex >= 0.75 || this.dist(lm[8], lm[5]) > palmScale * 0.40) && sMiddle < 0.82 && sRing < 0.82;
    }

    // 'I', 'J', 'Y' require pinky extended, index and middle curled
    if (['I', 'J', 'Y'].includes(label)) {
      return sPinky >= 0.78 && sIndex < 0.82 && sMiddle < 0.82;
    }

    // Fist letters ('A', 'E', 'M', 'N', 'S', 'T') require at least 3 fingers curled into palm
    if (['A', 'E', 'M', 'N', 'S', 'T'].includes(label)) {
      const curledCount =
        (sIndex < 0.85 ? 1 : 0) +
        (sMiddle < 0.85 ? 1 : 0) +
        (sRing < 0.85 ? 1 : 0) +
        (sPinky < 0.85 ? 1 : 0);
      return curledCount >= 3;
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
   * Strictly distinguishes all 26 alphabets (A through Z) without false-positive defaults.
   */
  private classifyLandmarks(lm: LandmarkPoint[]): { letter: string; confidence: number } {
    const wrist = lm[0];
    const palmScale = Math.hypot(lm[9].x - wrist.x, lm[9].y - wrist.y) || 0.2;

    // Self-normalizing finger evaluation helper (rotation-invariant distance checks & joint straightness)
    const evalFinger = (tipIdx: number, dipIdx: number, pipIdx: number, mcpIdx: number) => {
      const straightness = this.getStraightness(lm, tipIdx, dipIdx, pipIdx, mcpIdx);
      const dTipMcp = this.dist(lm[tipIdx], lm[mcpIdx]);
      const dPipMcp = this.dist(lm[pipIdx], lm[mcpIdx]) || 0.001;
      const dTipWrist = this.dist(lm[tipIdx], wrist);
      const dPipWrist = this.dist(lm[pipIdx], wrist);

      // Extended: straight finger (straightness >= 0.82), tip is far from MCP and wrist
      const isExtended = straightness >= 0.82 && dTipMcp / dPipMcp > 1.20 && dTipWrist > dPipWrist * 1.04;
      // Straight UP in screen space: tip is above PIP
      const isUp = isExtended && lm[tipIdx].y < lm[pipIdx].y;
      // Curled: folded into palm (low straightness or short tip distance)
      const isCurled = !isExtended || straightness < 0.72 || dTipMcp < palmScale * 0.52;
      // Arched / curved (as in C and O)
      const isArched = straightness >= 0.40 && straightness <= 0.94 && dTipMcp > palmScale * 0.20;

      return {
        straightness,
        isExtended,
        isUp,
        isCurled,
        isArched,
        dTipMcp,
        dTipWrist,
        pipRaised: lm[mcpIdx].y - lm[pipIdx].y > palmScale * 0.20,
      };
    };

    const fIndex = evalFinger(8, 7, 6, 5);
    const fMiddle = evalFinger(12, 11, 10, 9);
    const fRing = evalFinger(16, 15, 14, 13);
    const fPinky = evalFinger(20, 19, 18, 17);

    // Thumb relative distances
    const dThumbIndex = this.dist(lm[4], lm[8]) / palmScale;
    const dThumbMiddle = this.dist(lm[4], lm[12]) / palmScale;

    const isThumbUp = lm[4].y < lm[3].y + palmScale * 0.04 && lm[4].y < lm[2].y;
    const isThumbExtOut =
      this.dist(lm[4], lm[2]) > palmScale * 0.48 &&
      this.dist(lm[4], lm[9]) > palmScale * 0.48;
    const isThumbAcrossPalm =
      this.dist(lm[4], lm[13]) < palmScale * 0.60 ||
      this.dist(lm[4], lm[9]) < palmScale * 0.55;

    const dIndexMiddle = this.dist(lm[8], lm[12]) / palmScale;
    const dMiddleRing = this.dist(lm[12], lm[16]) / palmScale;
    const dRingPinky = this.dist(lm[16], lm[20]) / palmScale;

    // Relative directional vectors
    const dxIndex = lm[8].x - lm[5].x;
    const dyIndex = lm[8].y - lm[5].y;
    const dxMiddle = lm[12].x - lm[9].x;
    const dyMiddle = lm[12].y - lm[9].y;

    const isIndexPointingDown = dyIndex > palmScale * 0.20 && fIndex.isExtended;
    const isMiddlePointingDown = dyMiddle > palmScale * 0.20 && fMiddle.isExtended;
    const isIndexHorizontal =
      fIndex.isExtended &&
      Math.abs(dxIndex) > Math.abs(dyIndex) * 0.70 &&
      Math.abs(dxIndex) > palmScale * 0.35;
    const isMiddleHorizontal =
      fMiddle.isExtended &&
      Math.abs(dxMiddle) > Math.abs(dyMiddle) * 0.70 &&
      Math.abs(dxMiddle) > palmScale * 0.35;

    // ==========================================
    // 1. CIRCULAR / ARCHED SHAPES (O, C)
    // Evaluated early so open/fist checks don't hijack them!
    // ==========================================
    // 'O': Fingertips form a closed circle with thumb touching index/middle tip
    const isOFormed =
      dThumbIndex < 0.22 &&
      (dThumbMiddle < 0.32 || dIndexMiddle < 0.30) &&
      !fPinky.isUp;

    if (isOFormed) {
      return { letter: 'O', confidence: 0.98 };
    }


    // ==========================================
    // 2. ALL 4 FINGERS EXTENDED (B vs OPEN PALM)
    // ==========================================
    const areFourExtended =
      (fIndex.isExtended || fIndex.straightness >= 0.82) &&
      (fMiddle.isExtended || fMiddle.straightness >= 0.82) &&
      (fRing.isExtended || fRing.straightness >= 0.80) &&
      (fPinky.isExtended || fPinky.straightness >= 0.78);

    if (areFourExtended) {
      const areFourStraight =
        fIndex.straightness >= 0.82 &&
        fMiddle.straightness >= 0.82 &&
        fRing.straightness >= 0.80 &&
        fPinky.straightness >= 0.78;
      const areFourUp = fIndex.isUp && fMiddle.isUp && fRing.isUp && fPinky.isUp;
      const areFourTogether = dIndexMiddle <= 0.22 && dMiddleRing <= 0.22 && dRingPinky <= 0.22;
      const isThumbFoldedAcross =
        (this.dist(lm[4], lm[13]) < palmScale * 0.52 || this.dist(lm[4], lm[9]) < palmScale * 0.50) &&
        !isThumbExtOut &&
        dThumbIndex >= 0.55;

      // 'B': All 4 fingers straight UP, held together, thumb folded across palm
      if (areFourStraight && areFourUp && areFourTogether && isThumbFoldedAcross) {
        return { letter: 'B', confidence: 0.98 };
      }

      // Any other 4-finger extended gesture is OPEN PALM / RELAXED HAND -> NEUTRAL
      return { letter: '', confidence: 0.0 };
    }

    // ==========================================
    // 3. 3 FINGERS EXTENDED UP (W, F)
    // ==========================================
    // 'F': "OK" sign - Thumb touches Index tip in a circle, other 3 fingers UP
    if (dThumbIndex < 0.45 && fMiddle.isUp && fRing.isUp && fPinky.isUp) {
      return { letter: 'F', confidence: 0.98 };
    }

    // 'W': Index, Middle, Ring UP, Pinky curled
    if (fIndex.isUp && fMiddle.isUp && fRing.isUp && fPinky.isCurled) {
      return { letter: 'W', confidence: 0.98 };
    }

    // ==========================================
    // 4. TWO FINGERS (Index + Middle) EXTENDED (V, U, R, K, H, P)
    // ==========================================
    if (fIndex.isExtended && fMiddle.isExtended && fRing.isCurled && fPinky.isCurled) {
      // 'P': Pointing downward
      if (isIndexPointingDown && isMiddlePointingDown) {
        return { letter: 'P', confidence: 0.96 };
      }
      // 'H': Pointing horizontally
      if (isIndexHorizontal && isMiddleHorizontal && dIndexMiddle < 0.45) {
        return { letter: 'H', confidence: 0.96 };
      }
      // Pointing UP
      if (fIndex.isUp && fMiddle.isUp) {
        // 'R': Crossed fingers (ordering of tips is inverted relative to MCP knuckles)
        const isCrossed = (lm[8].x - lm[12].x) * (lm[5].x - lm[9].x) < 0;
        if (isCrossed) {
          return { letter: 'R', confidence: 0.98 };
        }
        // 'K': Thumb upright between index and middle knuckles
        if ((isThumbUp || this.dist(lm[4], lm[6]) < palmScale * 0.45) && !isThumbAcrossPalm && dIndexMiddle >= 0.18) {
          return { letter: 'K', confidence: 0.96 };
        }
        // 'V': Spread apart
        if (dIndexMiddle >= 0.22) {
          return { letter: 'V', confidence: 0.98 };
        }
        // 'U': Held together side-by-side (and not crossed)
        return { letter: 'U', confidence: 0.97 };
      }
    }

    // ==========================================
    // 5. ONE FINGER: PINKY ALONE (I, J, Y)
    // ==========================================
    if (fPinky.isUp && fIndex.isCurled && fMiddle.isCurled && fRing.isCurled) {
      // 'Y': Pinky and Thumb extended out ("Hang Loose" / Shaka)
      if (isThumbExtOut) {
        return { letter: 'Y', confidence: 0.98 };
      }
      // 'J': Pinky curving / dipping
      if (lm[20].y > lm[18].y || Math.abs(lm[20].x - lm[17].x) > palmScale * 0.48) {
        return { letter: 'J', confidence: 0.94 };
      }
      // 'I': Pinky straight UP, thumb folded across fingers
      return { letter: 'I', confidence: 0.98 };
    }

    // ==========================================
    // 6. ONE FINGER: INDEX ALONE (D, G, L, Q, X, Z)
    // ==========================================
    if (fIndex.isExtended && fMiddle.isCurled && fRing.isCurled && fPinky.isCurled) {
      // 'L': Index UP, Thumb extended OUT at 90°
      if (fIndex.isUp && isThumbExtOut && dThumbIndex > 0.45 && !isIndexPointingDown) {
        return { letter: 'L', confidence: 0.98 };
      }
      // 'Q': Index pointing downward with thumb parallel down
      if (isIndexPointingDown && lm[4].y > lm[2].y) {
        return { letter: 'Q', confidence: 0.95 };
      }
      // 'G': Index extended horizontally with thumb parallel
      if (isIndexHorizontal && this.dist(lm[4], lm[8]) < palmScale * 0.85) {
        return { letter: 'G', confidence: 0.96 };
      }
      // 'Z': Index pointing forward / sideways with thumb folded
      if (isThumbAcrossPalm && Math.abs(dxIndex) > Math.abs(dyIndex) * 0.70) {
        return { letter: 'Z', confidence: 0.94 };
      }
      // 'D': Index UP, thumb tip touches middle fingertip/knuckle forming 'O' ring
      if (fIndex.isUp && (dThumbMiddle < 0.55 || this.dist(lm[4], lm[10]) < palmScale * 0.52 || !isThumbExtOut)) {
        return { letter: 'D', confidence: 0.97 };
      }
    }

    // 'X': Hooked index finger (PIP raised, but tip bent down)
    const isIndexHooked =
      fIndex.pipRaised &&
      (lm[8].y > lm[6].y || this.dist(lm[8], lm[5]) < this.dist(lm[6], lm[5]) * 1.35) &&
      fMiddle.isCurled &&
      fRing.isCurled &&
      fPinky.isCurled;

    if (isIndexHooked) {
      return { letter: 'X', confidence: 0.96 };
    }

    // ==========================================
    // 6.5 ARCHED 'C' (Cupped Hand, Open Aperture)
    // Only evaluated when NO fingers are extended straight!
    // ==========================================
    const noneUpright = !fIndex.isUp && !fMiddle.isUp && !fRing.isUp && !fPinky.isUp;
    const noFingersExtended = !fIndex.isExtended && !fMiddle.isExtended && !fRing.isExtended && !fPinky.isExtended;
    const areCurvedArc =
      fIndex.straightness >= 0.45 && fIndex.straightness <= 0.88 &&
      fMiddle.straightness >= 0.45 && fMiddle.straightness <= 0.88;
    const isCGap = dThumbIndex >= 0.28 && dThumbIndex <= 1.35 && dThumbMiddle >= 0.28;
    const isFingersNotFist =
      this.dist(lm[8], lm[5]) > palmScale * 0.28 &&
      (this.dist(lm[8], lm[0]) > palmScale * 0.65 || lm[8].y < lm[5].y + palmScale * 0.15);
    const isThumbCuppedOut =
      this.dist(lm[4], lm[13]) > palmScale * 0.38 &&
      this.dist(lm[4], lm[9]) > palmScale * 0.32;

    if (noFingersExtended && areCurvedArc && isCGap && isFingersNotFist && isThumbCuppedOut && noneUpright) {
      return { letter: 'C', confidence: 0.98 };
    }

    // ==========================================
    // 7. FIST LETTERS (A, E, M, N, S, T)
    // Strict requirement: all 4 fingers must be folded/curled into the palm
    // ==========================================
    const atLeastThreeCurled =
      (fIndex.isCurled ? 1 : 0) +
      (fMiddle.isCurled ? 1 : 0) +
      (fRing.isCurled ? 1 : 0) +
      (fPinky.isCurled ? 1 : 0) >= 3;

    const isTrueFist = noneUpright && atLeastThreeCurled;

    if (isTrueFist) {
      const dThumbIndexTip = this.dist(lm[4], lm[8]) / palmScale;
      const dThumbMiddleTip = this.dist(lm[4], lm[12]) / palmScale;
      const dThumbIndexPip = this.dist(lm[4], lm[6]) / palmScale;
      const dThumbMiddlePip = this.dist(lm[4], lm[10]) / palmScale;

      const d4_5 = this.dist(lm[4], lm[5]) / palmScale;   // Index MCP knuckle
      const d4_9 = this.dist(lm[4], lm[9]) / palmScale;   // Middle MCP knuckle
      const d4_13 = this.dist(lm[4], lm[13]) / palmScale; // Ring MCP knuckle
      const d4_17 = this.dist(lm[4], lm[17]) / palmScale; // Pinky MCP knuckle

      const isThumbPointingUp = lm[4].y < lm[3].y + palmScale * 0.02;

      // 1. 'M': Thumb tucked under 3 fingers, closest to Pinky (17) / Ring (13) knuckles
      if (d4_17 < d4_5 && (d4_17 <= 0.52 || d4_13 <= 0.50)) {
        return { letter: 'M', confidence: 0.98 };
      }

      // 2. 'A': Thumb UP alongside outside lateral edge of index finger (beside knuckle)
      if (
        (isThumbUp || lm[4].y < lm[6].y + palmScale * 0.08) &&
        d4_5 < 0.60 &&
        d4_17 > 0.38
      ) {
        return { letter: 'A', confidence: 0.98 };
      }

      // 3. 'E': All 4 fingertips curled down tightly, resting ON TOP of the thumb (thumb below fingertips)
      if (
        dThumbIndexTip < 0.38 &&
        dThumbMiddleTip < 0.38 &&
        lm[4].y >= lm[8].y - palmScale * 0.04 &&
        lm[4].y >= lm[12].y - palmScale * 0.04
      ) {
        return { letter: 'E', confidence: 0.96 };
      }

      // 4. 'T': Thumb tucked under 1 finger (Index ONLY), peeking UP between Index (5) and Middle (9)
      const isNestledBetweenIndexMiddle =
        d4_5 < d4_13 &&
        d4_9 < d4_13 &&
        d4_5 < d4_17 &&
        (d4_5 <= 0.48 || d4_9 <= 0.48);

      if (
        isNestledBetweenIndexMiddle &&
        isThumbPointingUp &&
        lm[4].y <= lm[5].y + palmScale * 0.08
      ) {
        return { letter: 'T', confidence: 0.98 };
      }

      // 5. 'N': Thumb tucked under 2 fingers, centered between Middle (9) and Ring (13) knuckles
      if (
        d4_13 < d4_5 &&
        (d4_9 <= 0.48 || d4_13 <= 0.48) &&
        d4_17 >= 0.26
      ) {
        return { letter: 'N', confidence: 0.98 };
      }

      // 6. 'S': Thumb wrapped horizontally across front of curled fingers (over PIP joints)
      if (
        dThumbIndexPip < 0.48 &&
        dThumbMiddlePip < 0.48 &&
        dThumbIndexTip < 0.45 &&
        this.dist(lm[8], wrist) < palmScale * 1.20
      ) {
        return { letter: 'S', confidence: 0.96 };
      }

      // Fallback 'A' if thumb is upright alongside fist
      if (isThumbUp && d4_5 < 0.62 && d4_17 > 0.38) {
        return { letter: 'A', confidence: 0.92 };
      }

      return { letter: '', confidence: 0.0 };
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
