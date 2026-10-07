/**
 * FastAPI Inference Service Configuration
 *
 * Target: SignMate_MobileNetV3Small
 * Model Artifact: SignMate_stage1_best.keras
 * Labels: signmate_labels.json
 * Classes: 27 (0 = "0" / no-hand, 1..26 = A..Z)
 * Input: [1, 160, 160, 1] float32 grayscale (pixel values 0-255)
 * Accuracy: ~97% independent test accuracy
 */

export const SIGNMATE_MODEL_FILENAME = 'SignMate_stage1_best.keras';
export const SIGNMATE_LABELS_FILE = 'signmate_labels.json';

export const SIGNMATE_LABELS: Record<number, string> = {
  0: '0',
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'D',
  5: 'E',
  6: 'F',
  7: 'G',
  8: 'H',
  9: 'I',
  10: 'J',
  11: 'K',
  12: 'L',
  13: 'M',
  14: 'N',
  15: 'O',
  16: 'P',
  17: 'Q',
  18: 'R',
  19: 'S',
  20: 'T',
  21: 'U',
  22: 'V',
  23: 'W',
  24: 'X',
  25: 'Y',
  26: 'Z',
};

// Legacy alias for compatibility
export const ISL_CLASSES = SIGNMATE_LABELS;

export interface FastApiAiConfig {
  baseUrl: string;
  inferenceEndpoint: string;
  timeoutMs: number;
}

export function getFastApiConfig(): FastApiAiConfig {
  return {
    baseUrl: import.meta.env.VITE_AI_API_BASE_URL || 'http://localhost:8000',
    inferenceEndpoint: '/api/v1/predict',
    timeoutMs: 5000,
  };
}
