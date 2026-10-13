"""
Chapter 8: Machine Learning Dataset & Preprocessing Pipeline
"""

def get_chapter_8():
    return """
    <section id="chapter-8" class="page-break">
        <h1>Chapter 8: Machine Learning Dataset & Preprocessing Pipeline</h1>

        <h2>8.1 Dataset Profile & Confirmed Inventory</h2>
        <p>
            The machine learning model powering SignMate was trained on a specialized computer vision dataset engineered for static Indian Sign Language (ISL) fingerspelling alphabet recognition. The dataset properties are summarized below:
        </p>

        <table>
            <thead>
                <tr>
                    <th style="width: 30%;">Dataset Attribute</th>
                    <th style="width: 70%;">Confirmed Value / Specification</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Archive Size</strong></td>
                    <td>Approximately 440 MB (compressed ZIP archive)</td>
                </tr>
                <tr>
                    <td><strong>Total Image Samples</strong></td>
                    <td><strong>17,113 images</strong></td>
                </tr>
                <tr>
                    <td><strong>Training Set Split</strong></td>
                    <td><strong>12,845 images</strong> (~75.06% of total data)</td>
                </tr>
                <tr>
                    <td><strong>Independent Testing Split</strong></td>
                    <td><strong>4,268 images</strong> (~24.94% of total data)</td>
                </tr>
                <tr>
                    <td><strong>Total Output Classes</strong></td>
                    <td><strong>27 distinct classes</strong></td>
                </tr>
                <tr>
                    <td><strong>Class Index 0</strong></td>
                    <td><strong>Background / Neutral / No-Hand State</strong> (Crucial negative control)</td>
                </tr>
                <tr>
                    <td><strong>Class Indices 1–26</strong></td>
                    <td>English Letters <strong>A through Z</strong> (Standard ISL manual fingerspelling)</td>
                </tr>
                <tr>
                    <td><strong>Color Mode</strong></td>
                    <td>Single-channel Grayscale (Luminance channel)</td>
                </tr>
                <tr>
                    <td><strong>Raw Dimensions</strong></td>
                    <td>Approximately 310 × 310 pixels (JPEG format)</td>
                </tr>
                <tr>
                    <td><strong>Target Model Input Shape</strong></td>
                    <td><strong>160 × 160 × 1</strong> (Height × Width × Channels, float32)</td>
                </tr>
                <tr>
                    <td><strong>Pixel Value Range</strong></td>
                    <td>0.0 to 255.0 (Single-channel 8-bit unscaled float)</td>
                </tr>
                <tr>
                    <td><strong>Directory Partitioning</strong></td>
                    <td>Strict physical filesystem separation between <code>train/</code> and <code>test/</code></td>
                </tr>
                <tr>
                    <td><strong>Dataset Provenance & License</strong></td>
                    <td>Curated academic sign language benchmark; formal repository license requires external institutional verification.</td>
                </tr>
            </tbody>
        </table>

        <h2>8.2 Core Machine Learning Concepts in Plain English</h2>
        <div class="note-box">
            <ul style="margin-left: 15px; margin-bottom: 0;">
                <li><strong>Dataset:</strong> A structured collection of data samples (here, 17,113 photos) used to teach and evaluate an artificial intelligence algorithm.</li>
                <li><strong>Class (or Label):</strong> A category the model must distinguish. SignMate has 27 classes: 1 class for "no sign/background" and 26 classes for letters 'A' through 'Z'.</li>
                <li><strong>Sample:</strong> A single individual item in the dataset—in our case, one photo of a hand making a sign.</li>
                <li><strong>Training Data:</strong> The textbook used by the neural network to learn patterns. The model adjusts its internal mathematical weights based on training errors.</li>
                <li><strong>Testing Data:</strong> The final exam. A set of photos that the model has <em>never seen before</em> during training, used strictly to measure real generalization performance.</li>
                <li><strong>Data Leakage:</strong> A fatal machine learning error occurring when test images accidentally mix into the training set. This causes artificially high exam scores that fail completely when deployed in the real world.</li>
                <li><strong>Balanced Classes:</strong> Ensuring that each of the 27 categories has approximately the same number of sample images (around 475 images per class in training), preventing the model from becoming biased toward one frequent letter.</li>
                <li><strong>Grayscale vs. RGB:</strong> Standard RGB images use 3 color channels (Red, Green, Blue). Grayscale images use 1 single channel measuring light intensity from 0 (pitch black) to 255 (pure white). Grayscale reduces memory consumption by 66.7% and makes the model invariant to differences in human skin tones.</li>
            </ul>
        </div>

        <h2>8.3 The Paramount Importance of Class 0 (Background / No-Hand)</h2>
        <div class="alert-box">
            <div class="alert-box-title">CRITICAL EXAM CONCEPT: WHY CLASS 0 MATTERS</div>
            <p>
                <strong>What happens if a classifier is trained on ONLY letters A–Z (26 classes)?</strong>
            </p>
            <p>
                If a user simply sits in front of the webcam, rests their hands, scratches their nose, or leaves the room, a 26-class model is <em>mathematically forced</em> to pick one of the 26 letters! It will continuously output false positive letters (e.g., repeatedly outputting 'C' or 'O' when viewing an empty chair or wall).
            </p>
            <p style="margin-bottom: 0;">
                By adding <strong>Class 0 (Background / No-Hand)</strong> containing photos of empty rooms, neutral backgrounds, resting arms, and non-gesture frames, the Softmax layer assigns high probability to Class 0 when no valid sign is performed. In code, <code>signmate_labels.json</code> maps <code>"0": ""</code> (empty string), silently ignoring background frames.
            </p>
        </div>

        <h2>8.4 Image Preprocessing & The Double-Normalization Trap</h2>
        <p>
            The preprocessing pipeline transforms raw webcam video frames into the exact tensor format expected by the neural network:
        </p>

        <div class="diagram-container">
            <svg viewBox="0 0 740 100" width="100%" height="auto" style="max-height: 90px;" xmlns="http://www.w3.org/2000/svg">
                <rect width="740" height="100" fill="#f8fafc" rx="6"/>
                <!-- Box 1 -->
                <rect x="15" y="25" width="125" height="50" fill="#eff6ff" stroke="#3b82f6" rx="4" />
                <text x="77" y="47" font-family="Inter, sans-serif" font-size="9" font-weight="bold" fill="#1e40af" text-anchor="middle">Raw Web Frame</text>
                <text x="77" y="62" font-family="Inter, sans-serif" font-size="7.5" fill="#475569" text-anchor="middle">1280x720 RGB</text>

                <!-- Box 2 -->
                <rect x="165" y="25" width="125" height="50" fill="#eff6ff" stroke="#3b82f6" rx="4" />
                <text x="227" y="47" font-family="Inter, sans-serif" font-size="9" font-weight="bold" fill="#1e40af" text-anchor="middle">Hand Bounding Box</text>
                <text x="227" y="62" font-family="Inter, sans-serif" font-size="7.5" fill="#475569" text-anchor="middle">1:1 Square Crop</text>

                <!-- Box 3 -->
                <rect x="315" y="25" width="125" height="50" fill="#eff6ff" stroke="#3b82f6" rx="4" />
                <text x="377" y="47" font-family="Inter, sans-serif" font-size="9" font-weight="bold" fill="#1e40af" text-anchor="middle">Luminance Grayscale</text>
                <text x="377" y="62" font-family="Inter, sans-serif" font-size="7.5" fill="#475569" text-anchor="middle">L-Mode Conversion</text>

                <!-- Box 4 -->
                <rect x="465" y="25" width="125" height="50" fill="#eff6ff" stroke="#3b82f6" rx="4" />
                <text x="527" y="47" font-family="Inter, sans-serif" font-size="9" font-weight="bold" fill="#1e40af" text-anchor="middle">Bilinear Resize</text>
                <text x="527" y="62" font-family="Inter, sans-serif" font-size="7.5" fill="#475569" text-anchor="middle">160 x 160 Pixels</text>

                <!-- Box 5 -->
                <rect x="615" y="25" width="110" height="50" fill="#dcfce7" stroke="#16a34a" rx="4" />
                <text x="670" y="47" font-family="Inter, sans-serif" font-size="9" font-weight="bold" fill="#14532d" text-anchor="middle">Final Tensor</text>
                <text x="670" y="62" font-family="Inter, sans-serif" font-size="7.5" fill="#15803d" text-anchor="middle">[1, 160, 160, 1]</text>

                <!-- Arrows -->
                <path d="M 140 50 L 165 50" stroke="#94a3b8" stroke-width="1.5" />
                <path d="M 290 50 L 315 50" stroke="#94a3b8" stroke-width="1.5" />
                <path d="M 440 50 L 465 50" stroke="#94a3b8" stroke-width="1.5" />
                <path d="M 590 50 L 615 50" stroke="#94a3b8" stroke-width="1.5" />
            </svg>
            <div class="diagram-caption">Figure 8.1: Image Preprocessing Pipeline to Input Tensor</div>
        </div>

        <div class="alert-box">
            <div class="alert-box-title">THE DOUBLE-NORMALIZATION BUG: WHAT HAPPENED & WHY IT MATTERS</div>
            <p>
                <strong>Question:</strong> "Why does <code>fastapi_server.py</code> keep pixel values in the range <code>0–255</code> instead of dividing by 255?"
            </p>
            <p style="margin-bottom: 0;">
                <strong>Explanation:</strong> During model architecture construction, MobileNetV3Small was instantiated with <code>include_preprocessing=True</code>. This means the model internally encapsulates a <code>Rescaling</code> normalization layer that automatically expects raw <code>0–255</code> input and scales it internally. In an earlier development experiment, external code divided pixel values by 255 (producing values <code>0.0–1.0</code>). The internal model layer divided by 255 a second time (producing near-zero values <code>0.000–0.0039</code>), completely destroying the signal and breaking inference accuracy! Correcting this verified that inputs must remain in the range <strong>0 to 255</strong>.
            </p>
        </div>
    </section>
    """
