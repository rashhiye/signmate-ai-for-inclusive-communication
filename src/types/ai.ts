/**
 * AI inference state and metadata
 * Target Model: SignMate_MobileNetV3Small (27 classes: 0 = background/no hand, 1–26 = A–Z)
 * Input: [1,160,160,1] float32 grayscale, pixel range 0–255
 */

export type AIState = 'off' | 'loading' | 'active' | 'error';

export interface PredictionResult {
  predictedClass: number; // 0 = background/no hand, 1-26 = A-Z
  label: string; // e.g. "H", "E", "L", or ""
  confidence: number; // 0.0 - 1.0 (97% benchmark accuracy)
  inferenceTimeMs?: number;
}

export interface RecognitionState {
  state: AIState;
  recognizedText: string;
  currentPrediction: string | null;
  confidence: number;
  suggestions: string[];
  error: string | null;
}

export interface AIModelMetadata {
  name: 'SignMate_MobileNetV3Small';
  classesCount: 27;
  inputShape: [1, 160, 160, 1];
  colorMode: 'grayscale';
  pixelRange: [0, 255];
  benchmarkAccuracy: number;
}
