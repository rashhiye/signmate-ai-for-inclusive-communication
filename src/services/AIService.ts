import type { PredictionResult, AIModelMetadata } from '../types/ai';
import { ServiceNotImplementedError } from './AuthService';

export interface IAIService {
  predict(frameData: ImageData | Blob): Promise<PredictionResult>;
  startRecognition(): Promise<void>;
  stopRecognition(): Promise<void>;
  getModelMetadata(): AIModelMetadata;
}

/**
 * Base AIService abstraction.
 * Prepared for FastAPI inference server communicating with SignMate_MobileNetV3Small.
 * Input specification: [1, 160, 160, 1] float32 grayscale, pixel range 0-255.
 * Output: 27 classes (0 = background/no hand, 1-26 = A-Z).
 */
export class AIService implements IAIService {
  private static instance: AIService;

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  getModelMetadata(): AIModelMetadata {
    return {
      name: 'SignMate_MobileNetV3Small',
      classesCount: 27,
      inputShape: [1, 160, 160, 1],
      colorMode: 'grayscale',
      pixelRange: [0, 255],
      benchmarkAccuracy: 0.97, // ~97% independent test accuracy
    };
  }

  async predict(_frameData: ImageData | Blob): Promise<PredictionResult> {
    throw new ServiceNotImplementedError('AIService', 'predict');
  }

  async startRecognition(): Promise<void> {
    throw new ServiceNotImplementedError('AIService', 'startRecognition');
  }

  async stopRecognition(): Promise<void> {
    throw new ServiceNotImplementedError('AIService', 'stopRecognition');
  }
}

export const aiService = AIService.getInstance();
