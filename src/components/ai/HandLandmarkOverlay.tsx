import React, { useRef, useEffect } from 'react';
import type { LandmarkPoint } from '../../ai/handSignDetector';

interface HandLandmarkOverlayProps {
  hasHand: boolean;
  landmarks?: LandmarkPoint[];
  box?: { x: number; y: number; width: number; height: number };
  letter?: string;
  confidence?: number;
  source?: string;
  isMirrored?: boolean;
}

const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm base
  [5, 9], [9, 13], [13, 17],
];

export const HandLandmarkOverlay: React.FC<HandLandmarkOverlayProps> = ({
  hasHand,
  landmarks,
  letter,
  confidence = 0,
  isMirrored = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas dimensions to parent display
    const rect = canvas.getBoundingClientRect();
    const displayWidth = Math.floor(rect.width) || 640;
    const displayHeight = Math.floor(rect.height) || 480;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!hasHand || !landmarks || landmarks.length === 0) return;

    const w = canvas.width;
    const h = canvas.height;

    // Coordinate conversion function considering mirroring
    const getCoords = (p: LandmarkPoint) => {
      const x = isMirrored ? (1 - p.x) * w : p.x * w;
      const y = p.y * h;
      return { x, y };
    };

    // 1. Draw Skeleton Connections
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.85)'; // Emerald / Cyan glow
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    HAND_CONNECTIONS.forEach(([i, j]) => {
      if (landmarks[i] && landmarks[j]) {
        const p1 = getCoords(landmarks[i]);
        const p2 = getCoords(landmarks[j]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });

    // 2. Draw Landmark Joints
    landmarks.forEach((p, idx) => {
      const { x, y } = getCoords(p);
      ctx.beginPath();
      // Highlight fingertips
      const isTip = [4, 8, 12, 16, 20].includes(idx);
      ctx.arc(x, y, isTip ? 5 : 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = isTip ? '#facc15' : '#38bdf8'; // Yellow for tips, Sky blue for joints
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    });

    // 3. Draw Bounding Box around hand
    const points = landmarks.map(getCoords);
    const minX = Math.min(...points.map((p) => p.x)) - 15;
    const maxX = Math.max(...points.map((p) => p.x)) + 15;
    const minY = Math.min(...points.map((p) => p.y)) - 25;
    const maxY = Math.max(...points.map((p) => p.y)) + 15;
    const boxW = maxX - minX;
    const boxH = maxY - minY;

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.9)'; // Bright yellow box
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(minX, minY, boxW, boxH);
    ctx.setLineDash([]);

    // 4. Draw Label Badge
    if (letter) {
      const badgeX = Math.max(10, Math.min(w - 70, minX + boxW / 2 - 25));
      const badgeY = Math.max(35, minY - 10);

      // Badge background pill
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY - 26, 50, 26, [8]);
      ctx.fill();

      // Badge text
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, badgeX + 25, badgeY - 13);
    }
  }, [hasHand, landmarks, letter, confidence, isMirrored]);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none select-none">
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* When no hand is detected, show helpful guide */}
      {!hasHand && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border border-dashed border-white/20 rounded-2xl w-48 h-48 flex flex-col items-center justify-center p-4 text-center bg-black/20 backdrop-blur-[1px]">
            <span className="text-2xl mb-1 opacity-70">✋</span>
            <span className="text-[11px] text-surface-400 font-medium leading-tight">
              Hold hand in frame to detect sign
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
