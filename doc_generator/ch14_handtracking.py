"""
Chapter 14: Hand Tracking & Landmark Visualization vs. Image Classification
"""

def get_chapter_14():
    return """
    <section id="chapter-14" class="page-break">
        <h1>Chapter 14: Hand Tracking & Landmark Visualization vs. Image Classification</h1>

        <h2>14.1 Distinguishing Three Different Computer Vision Tasks</h2>
        <div class="note-box">
            <ol style="margin-left: 15px; margin-bottom: 0;">
                <li><strong>Hand Landmark Tracking (MediaPipe Hands):</strong> Locates 21 precise 3D anatomical joint coordinates (wrist, knuckles, finger tips) on a hand from an RGB frame. It does <em>not</em> know what sign is being performed; it only knows where the hand parts are in 3D space.</li>
                <li><strong>Image Classification (MobileNetV3Small):</strong> Takes a 160×160 image pixel grid and maps it to a single categorical label (Classes 0–26). It evaluates the entire visual appearance (skin contour, shadows, finger overlap).</li>
                <li><strong>Continuous Sign Language Translation:</strong> A complex multi-modal NLP task involving temporal sequence modeling (e.g., Transformers or 3D CNNs) that interprets continuous signs, facial expressions, and spatial grammar over time into fluent sentences. (Future enhancement).</li>
            </ol>
        </div>

        <h2>14.2 MediaPipe Hands: 21 3D Anatomical Landmarks</h2>
        <p>
            SignMate utilizes Google MediaPipe Hands (loaded dynamically via CDN in <code>handSignDetector.ts</code>) to track 21 landmarks per hand:
        </p>

        <div class="diagram-container">
            <svg viewBox="0 0 600 240" width="100%" height="auto" style="max-height: 220px;" xmlns="http://www.w3.org/2000/svg">
                <rect width="600" height="240" fill="#f8fafc" rx="6"/>
                <!-- Wrist -->
                <circle cx="300" cy="205" r="6" fill="#ef4444" />
                <text x="300" y="222" font-family="Inter, sans-serif" font-size="8" font-weight="bold" fill="#b91c1c" text-anchor="middle">0: Wrist</text>

                <!-- Thumb -->
                <circle cx="230" cy="180" r="5" fill="#f59e0b" />
                <circle cx="200" cy="155" r="5" fill="#f59e0b" />
                <circle cx="180" cy="130" r="5" fill="#f59e0b" />
                <circle cx="165" cy="105" r="5" fill="#f59e0b" />
                <text x="165" y="92" font-family="Inter, sans-serif" font-size="8" fill="#b45309" text-anchor="middle">4: Thumb Tip</text>

                <!-- Index -->
                <circle cx="255" cy="140" r="5" fill="#10b981" />
                <circle cx="245" cy="100" r="5" fill="#10b981" />
                <circle cx="240" cy="65" r="5" fill="#10b981" />
                <circle cx="235" cy="35" r="5" fill="#10b981" />
                <text x="235" y="25" font-family="Inter, sans-serif" font-size="8" fill="#047857" text-anchor="middle">8: Index Tip</text>

                <!-- Middle -->
                <circle cx="295" cy="135" r="5" fill="#3b82f6" />
                <circle cx="295" cy="90" r="5" fill="#3b82f6" />
                <circle cx="295" cy="55" r="5" fill="#3b82f6" />
                <circle cx="295" cy="20" r="5" fill="#3b82f6" />
                <text x="295" y="10" font-family="Inter, sans-serif" font-size="8" fill="#1d4ed8" text-anchor="middle">12: Middle Tip</text>

                <!-- Ring -->
                <circle cx="335" cy="140" r="5" fill="#8b5cf6" />
                <circle cx="345" cy="100" r="5" fill="#8b5cf6" />
                <circle cx="350" cy="68" r="5" fill="#8b5cf6" />
                <circle cx="355" cy="40" r="5" fill="#8b5cf6" />
                <text x="355" y="30" font-family="Inter, sans-serif" font-size="8" fill="#6d28d9" text-anchor="middle">16: Ring Tip</text>

                <!-- Pinky -->
                <circle cx="370" cy="155" r="5" fill="#ec4899" />
                <circle cx="390" cy="125" r="5" fill="#ec4899" />
                <circle cx="405" cy="98" r="5" fill="#ec4899" />
                <circle cx="415" cy="70" r="5" fill="#ec4899" />
                <text x="415" y="60" font-family="Inter, sans-serif" font-size="8" fill="#be185d" text-anchor="middle">20: Pinky Tip</text>

                <!-- Skeleton Lines -->
                <path d="M 300 205 L 230 180 L 200 155 L 180 130 L 165 105" stroke="#f59e0b" stroke-width="2" fill="none" />
                <path d="M 300 205 L 255 140 L 245 100 L 240 65 L 235 35" stroke="#10b981" stroke-width="2" fill="none" />
                <path d="M 300 205 L 295 135 L 295 90 L 295 55 L 295 20" stroke="#3b82f6" stroke-width="2" fill="none" />
                <path d="M 300 205 L 335 140 L 345 100 L 350 68 L 355 40" stroke="#8b5cf6" stroke-width="2" fill="none" />
                <path d="M 300 205 L 370 155 L 390 125 L 405 98 L 415 70" stroke="#ec4899" stroke-width="2" fill="none" />
                <!-- Palm line -->
                <path d="M 230 180 L 255 140 L 295 135 L 335 140 L 370 155" stroke="#94a3b8" stroke-width="1.5" fill="none" />
            </svg>
            <div class="diagram-caption">Figure 14.1: Google MediaPipe 21 Hand Landmark Topology</div>
        </div>

        <h2>14.3 Exact Role of MediaPipe in SignMate</h2>
        <div class="alert-box">
            <div class="alert-box-title">CRITICAL EXAM CLARIFICATION: MEDIAPIPE IS NOT THE CLASSIFIER INPUT</div>
            <p style="margin-bottom: 4px;">
                <strong>Examiners will ask:</strong> "Does your MobileNetV3Small model take the 21 coordinate points as input?"
            </p>
            <p style="margin-bottom: 0;">
                <strong>Correct Answer:</strong> "No. MobileNetV3Small takes a <strong>160×160 single-channel image tensor</strong> as input, NOT coordinate points. MediaPipe serves two specific helper roles:
                <br>
                1. <strong>Dynamic Region-of-Interest (ROI) Cropping:</strong> It tracks the hand in 3D space, computes the minimum and maximum X and Y coordinates, and dynamically extracts a 1:1 square crop around the hand. This means the user is free to move around the camera frame rather than being forced to hold their hand inside a fixed on-screen box.
                <br>
                2. <strong>Neutral Palm Guard & Local Fallback:</strong> If MediaPipe detects that all 5 fingers are fully open (resting palm), it suppresses accidental letter outputs. If the Python backend is offline, MediaPipe landmarks are evaluated by <code>classifyLandmarks()</code> for standalone client-side prediction."
            </p>
        </div>

        <h2>14.4 Source Code Spotlight: Hand Landmark Canvas Overlay</h2>
        <p>
            The component in <code>src/components/ai/HandLandmarkOverlay.tsx</code> renders real-time visual feedback onto a transparent HTML5 canvas overlay:
        </p>

        <div class="code-title">File: src/components/ai/HandLandmarkOverlay.tsx (Lines 60–92)</div>
<pre><code>// Connect hand joints with skeleton lines
CONNECTIONS.forEach(([startIdx, endIdx]) => {
  const p1 = landmarks[startIdx];
  const p2 = landmarks[endIdx];
  if (p1 && p2) {
    ctx.beginPath();
    ctx.moveTo(p1.x * width, p1.y * height);
    ctx.lineTo(p2.x * width, p2.y * height);
    ctx.strokeStyle = '#38bdf8'; // Cyan skeleton color
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
});

// Render individual landmark joints
landmarks.forEach((p, idx) => {
  ctx.beginPath();
  ctx.arc(p.x * width, p.y * height, idx === 4 || idx === 8 ? 5 : 3, 0, 2 * Math.PI);
  ctx.fillStyle = idx === 0 ? '#ef4444' : '#38bdf8'; // Red wrist, cyan fingers
  ctx.fill();
});
</code></pre>
    </section>
    """
