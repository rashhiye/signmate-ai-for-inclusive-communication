import React, { useMemo } from 'react';

export const VoxelBackground: React.FC = () => {
  // Generate 20 floating 3D voxel cubes matching the sample code (Pages 50-51, 60)
  const voxels = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 15,
      scale: 0.5 + Math.random() * 0.8,
    }));
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-gradient-to-br from-black via-[#141414] to-[#252525]"
      aria-hidden="true"
    >
      <style>{`
        @keyframes floatVoxelKeyframe {
          0% {
            transform: translateY(105vh) rotateX(0deg) rotateY(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.8;
          }
          85% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-20vh) rotateX(360deg) rotateY(360deg);
            opacity: 0;
          }
        }
        .cube-3d {
          transform-style: preserve-3d;
        }
        .cube-face {
          position: absolute;
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .face-front  { transform: translateZ(18px); }
        .face-back   { transform: rotateY(180deg) translateZ(18px); }
        .face-right  { transform: rotateY(90deg) translateZ(18px); }
        .face-left   { transform: rotateY(-90deg) translateZ(18px); }
        .face-top    { transform: rotateX(90deg) translateZ(18px); }
        .face-bottom { transform: rotateX(-90deg) translateZ(18px); }
      `}</style>

      {voxels.map((v) => (
        <div
          key={v.id}
          className="absolute w-9 h-9 cube-3d"
          style={{
            left: `${v.left}%`,
            animation: `floatVoxelKeyframe ${v.duration}s infinite linear`,
            animationDelay: `-${v.delay}s`,
            transform: `scale(${v.scale})`,
          }}
        >
          <div className="cube-face face-front" />
          <div className="cube-face face-back" />
          <div className="cube-face face-right" />
          <div className="cube-face face-left" />
          <div className="cube-face face-top" />
          <div className="cube-face face-bottom" />
        </div>
      ))}
    </div>
  );
};
