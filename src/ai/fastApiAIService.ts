import type { IAIService } from '../services/AIService';
import type { PredictionResult, AIModelMetadata } from '../types/ai';
import { getFastApiConfig, SIGNMATE_LABELS, SIGNMATE_MODEL_FILENAME } from './fastApiConfig';

/**
 * FastAPI SignMate_MobileNetV3Small Inference Bridge
 * Sends downsampled grayscale frames [1, 160, 160, 1] to FastAPI backend.
 * Uses SignMate_stage1_best.keras and signmate_labels.json.
 */
export class FastApiAIService implements IAIService {
  private config = getFastApiConfig();
  private isStreaming = false;

  getModelMetadata(): AIModelMetadata {
    return {
      name: 'SignMate_MobileNetV3Small',
      classesCount: 27,
      inputShape: [1, 160, 160, 1],
      colorMode: 'grayscale',
      pixelRange: [0, 255],
      benchmarkAccuracy: 0.97,
    };
  }

  async predict(frameData: ImageData | Blob): Promise<PredictionResult> {
    const startTime = performance.now();

    try {
      let imageBlob: Blob;

      if (frameData instanceof ImageData) {
        // Convert ImageData to Blob using offscreen canvas
        imageBlob = await this.imageDataToBlob(frameData);
      } else {
        imageBlob = frameData;
      }

      const formData = new FormData();
      formData.append('file', imageBlob, 'frame.jpg');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

      const response = await fetch(`${this.config.baseUrl}${this.config.inferenceEndpoint}`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Inference API returned HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        predictedClass: data.predicted_class,
        label: data.label,
        confidence: data.confidence,
        inferenceTimeMs: data.inference_time_ms || performance.now() - startTime,
      };
    } catch {
      // Return neutral empty prediction on error or offline
      const latency = performance.now() - startTime;
      return {
        predictedClass: 0,
        label: '',
        confidence: 0,
        inferenceTimeMs: latency,
      };
    }
  }

  async startRecognition(): Promise<void> {
    this.isStreaming = true;
  }

  async stopRecognition(): Promise<void> {
    this.isStreaming = false;
  }

  getClassLabel(classIndex: number): string {
    return SIGNMATE_LABELS[classIndex] || '';
  }

  getModelFileName(): string {
    return SIGNMATE_MODEL_FILENAME;
  }

  public getIsStreaming(): boolean {
    return this.isStreaming;
  }

  private imageDataToBlob(imageData: ImageData): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get 2d context for image conversion'));
        return;
      }
      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to Blob conversion failed'));
        }
      }, 'image/jpeg', 0.85);
    });
  }
}

export const fastApiAIService = new FastApiAIService();
