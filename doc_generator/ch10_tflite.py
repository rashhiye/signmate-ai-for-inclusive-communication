"""
Chapter 10: TensorFlow Lite Deployment & Runtime Stabilization
"""

def get_chapter_10():
    return """
    <section id="chapter-10" class="page-break">
        <h1>Chapter 10: TensorFlow Lite Deployment & Runtime Stabilization</h1>

        <h2>10.1 What is TensorFlow Lite & Why Convert from Keras?</h2>
        <p>
            <strong>TensorFlow Lite (TFLite)</strong> is Google's high-performance, lightweight runtime engine designed for deploying machine learning models on edge devices, mobile phones, and web browsers.
        </p>

        <table>
            <thead>
                <tr>
                    <th>Dimension</th>
                    <th>Training Checkpoint (<code>.keras</code>)</th>
                    <th>Deployment Artifact (<code>.tflite</code>)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>File Size</strong></td>
                    <td><strong>5.27 MB</strong></td>
                    <td><strong>3.88 MB</strong> (4,070,012 bytes) — ~26% reduction</td>
                </tr>
                <tr>
                    <td><strong>Internal Contents</strong></td>
                    <td>Full computation graph, backward gradient ops, optimizer momentum vectors (Adam), training callbacks.</td>
                    <td>Stripped forward-inference FlatBuffer schema containing only layer weights and quantized operations.</td>
                </tr>
                <tr>
                    <td><strong>Target Environment</strong></td>
                    <td>Python training environments (Jupyter, Colab, workstation).</td>
                    <td>Production edge execution (embedded devices, mobile apps, WebAssembly browsers).</td>
                </tr>
                <tr>
                    <td><strong>Memory Overhead</strong></td>
                    <td>High (requires full TensorFlow/PyTorch framework in RAM).</td>
                    <td>Ultra-low (static memory allocation via FlatBuffers, sub-10MB RAM).</td>
                </tr>
            </tbody>
        </table>

        <h2>10.2 Tensor Specifications & Verification</h2>
        <p>
            Direct programmatic inspection using the TensorFlow Lite Interpreter verifies:
        </p>
        <ul>
            <li><strong>Input Tensor:</strong> <code>[1, 160, 160, 1]</code> &mdash; Batch size 1, 160 pixels height, 160 pixels width, 1 grayscale channel (<code>numpy.float32</code>).</li>
            <li><strong>Output Tensor:</strong> <code>[1, 27]</code> &mdash; Batch size 1, 27 probability values summing to 1.0 (<code>numpy.float32</code>).</li>
            <li><strong>Output Mapping:</strong> Index <code>0</code> represents Neutral/Background/No-Hand. Indices <code>1</code> to <code>26</code> represent letters <code>A</code> through <code>Z</code>.</li>
        </ul>

        <h2>10.3 The Runtime Stabilization Trio: Threshold, Smoothing & Debouncing</h2>
        <p>
            Directly committing letters from every raw camera frame causes chaotic text output (e.g., signing 'H' for 1 second produces <code>"HHHHHHHHH"</code>). SignMate solves this through three cooperating algorithms:
        </p>

        <div class="note-box">
            <div class="note-box-title">The Three Stabilization Stages</div>
            <ol style="margin-left: 15px; margin-bottom: 0;">
                <li><strong>Confidence Threshold (&ge; 0.70):</strong> Rejects ambiguous predictions. If the model's highest predicted probability is below 70%, the frame is discarded as noise or transitional hand movement.</li>
                <li><strong>Temporal Smoothing (2 Consecutive Frames &asymp; 240–360ms):</strong> A sign must remain identical across at least two consecutive evaluation frames before being accepted as an intentional gesture. This filters out fleeting hand jitters.</li>
                <li><strong>Debouncing & Intentional Hold Count (13 Frames &asymp; 1.5s):</strong> Once a letter (e.g., 'E') is committed, subsequent frames of 'E' are ignored. If the user intentionally wants a double letter (e.g., 'LL' in "HELLO"), they must hold the gesture continuously for 13 frames (~1.5 seconds) to trigger the second character. Dropping or relaxing the hand immediately resets the lock.</li>
            </ol>
        </div>

        <h2>10.4 Verified Runtime Pipeline in RoomPage.tsx</h2>
        <p>
            The pipeline below reflects the actual logic executed in <code>src/pages/RoomPage.tsx</code> (lines 360–445):
        </p>

        <div class="code-title">File: src/pages/RoomPage.tsx (Debouncing & Hold Count Logic)</div>
<pre><code>// 1. Detect hand release to reset committed letter
if (!result.hasHand || !result.letter || result.confidence &lt; 0.70) {
  releaseCount++;
  if (releaseCount &gt;= 2) {
    lastCommittedLetter = '';
    candidateLetter = '';
    stableCount = 0;
    holdCount = 0;
  }
}

// 2. Intentional double-letter hold detection (e.g., for "MOON", "HELLO")
if (validLetter === lastCommittedLetter) {
  holdCount++;
  // Require sustained hold of ~1.5s (13 frames @ 120ms) for deliberate duplicate
  if (holdCount &gt;= 13 && repeatCount === 0) {
    appendCharacter(validLetter);
    repeatCount = 1;
  }
  return;
}

// 3. Commit NEW letter when stable across 2 frames
if (validLetter === candidateLetter) {
  stableCount++;
  if (stableCount &gt;= 2) {
    appendCharacter(validLetter);
    lastCommittedLetter = validLetter;
    stableCount = 0;
  }
} else {
  candidateLetter = validLetter;
  stableCount = 1;
}
</code></pre>
    </section>
    """
