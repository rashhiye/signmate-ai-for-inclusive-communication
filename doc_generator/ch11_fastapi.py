"""
Chapter 11: FastAPI & Backend Inference Service
"""

def get_chapter_11():
    return """
    <section id="chapter-11" class="page-break">
        <h1>Chapter 11: FastAPI & Backend Inference Architecture</h1>

        <h2>11.1 What is FastAPI & Why is it Used in SignMate?</h2>
        <p>
            <strong>FastAPI</strong> is a modern, high-performance web framework for Python based on standard Python type hints and the Asynchronous Server Gateway Interface (ASGI).
        </p>

        <div class="note-box">
            <div class="note-box-title">Why FastAPI Over Flask or Django?</div>
            <ul style="margin-left: 15px; margin-bottom: 0;">
                <li><strong>Async Concurrency (ASGI):</strong> Powered by Starlette and Uvicorn, FastAPI handles thousands of concurrent requests asynchronously without blocking the Python execution thread.</li>
                <li><strong>Sub-Millisecond Overhead:</strong> Route handling overhead is near-zero, ensuring that the inference latency is dominated solely by the neural network computation.</li>
                <li><strong>Automatic Request Validation:</strong> Uses Pydantic data schemas to strictly validate incoming Base64 image strings and metadata payloads.</li>
                <li><strong>Seamless Python ML Interoperability:</strong> Runs natively in the same Python process as TensorFlow, Keras, NumPy, and PIL, eliminating inter-process communication overhead.</li>
            </ul>
        </div>

        <h2>11.2 Complete REST API Endpoints Specification</h2>
        <table>
            <thead>
                <tr>
                    <th style="width: 15%;">HTTP Method</th>
                    <th style="width: 25%;">Endpoint URL</th>
                    <th style="width: 30%;">Request Payload / Parameters</th>
                    <th style="width: 30%;">Response JSON Structure</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>GET</code></td>
                    <td><code>/</code>, <code>/api/v1/health</code></td>
                    <td>None</td>
                    <td><code>{"status": "online", "model_loaded": true, "model_file": "SignMate_stage1_best.keras", "input_shape": [1, 160, 160, 1], "classes_count": 27}</code></td>
                </tr>
                <tr>
                    <td><code>GET</code></td>
                    <td><code>/api/v1/labels</code></td>
                    <td>None</td>
                    <td><code>{"classes": {"0": "", "1": "A", ..., "26": "Z"}, "count": 27}</code></td>
                </tr>
                <tr>
                    <td><code>POST</code></td>
                    <td><code>/api/v1/predict/base64</code></td>
                    <td><code>{"image_base64": "data:image/jpeg;base64,..."}</code></td>
                    <td><code>{"predicted_class": 8, "label": "H", "confidence": 0.9824, "inference_time_ms": 34.2, "top_predictions": [...]}</code></td>
                </tr>
                <tr>
                    <td><code>POST</code></td>
                    <td><code>/api/v1/predict</code></td>
                    <td>Multipart form-data file upload (<code>file</code>)</td>
                    <td>Same prediction JSON as base64 endpoint.</td>
                </tr>
                <tr>
                    <td><code>POST</code></td>
                    <td><code>/api/v1/webrtc/{roomId}/signal</code></td>
                    <td><code>{"sender_id": "peer1", "signal_type": "offer", "payload": {...}}</code></td>
                    <td><code>{"status": "stored", "timestamp": 1728912345.6}</code> (LAN signaling backup)</td>
                </tr>
            </tbody>
        </table>

        <h2>11.3 Source Code Analysis: Image Preprocessing Function</h2>
        <p>
            The function below from <code>fastapi_server.py</code> (lines 139–157) handles all incoming image bytes before they reach the Keras neural network:
        </p>

        <div class="code-title">File: fastapi_server.py (Lines 139–157)</div>
<pre><code>def preprocess_image(image_bytes: bytes) -> np.ndarray:
    \"\"\"
    Transforms arbitrary image into [1, 160, 160, 1] float32 grayscale, pixel values 0-255.
    Cleanly handles alpha channels / transparent backgrounds.
    \"\"\"
    img = Image.open(io.BytesIO(image_bytes))
    if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
        bg = Image.new("RGB", img.size, (0, 0, 0))
        bg.paste(img, mask=img.convert("RGBA").split()[3])
        img = bg
    # Convert to single-channel Luminance grayscale
    img_gray = img.convert("L")
    # Bilinear resize to model target dimension
    img_resized = img_gray.resize(INPUT_SHAPE, Image.Resampling.BILINEAR)
    # Convert to float32 NumPy array with range 0..255 (NO double normalization)
    arr = np.array(img_resized, dtype=np.float32)
    # Expand dims to batch format [1, 160, 160, 1]
    tensor = np.expand_dims(arr, axis=(0, -1))
    return tensor
</code></pre>

        <div class="note-box">
            <div class="note-box-title">Line-by-Line Technical Explanation</div>
            <ul style="margin-left: 15px; margin-bottom: 0;">
                <li><code>Line 144: Image.open()</code> parses JPEG/PNG binary data into an in-memory PIL image without saving temporary files to disk.</li>
                <li><code>Lines 145–148:</code> Strips alpha/transparency channels by pasting transparent PNG pixels over a solid black RGB canvas, avoiding channel dimension mismatch errors.</li>
                <li><code>Line 150: img.convert("L")</code> extracts luminance via $Y = 0.299R + 0.587G + 0.114B$, reducing channel depth from 3 to 1.</li>
                <li><code>Line 152: resize((160, 160))</code> uses bilinear interpolation to standardize incoming video crops.</li>
                <li><code>Line 154: np.array(..., dtype=np.float32)</code> preserves unscaled 0–255 pixel values so the internal MobileNet Rescaling layer operates correctly.</li>
                <li><code>Line 156: np.expand_dims(arr, axis=(0, -1))</code> shapes the array into a 4-dimensional tensor suitable for batch inference.</li>
            </ul>
        </div>

        <h2>11.4 CORS Configuration & Network Security</h2>
        <p>
            Because the frontend is hosted on Vercel (<code>signmate-ashy.vercel.app</code>) while the FastAPI server can run on a separate origin (e.g., <code>http://localhost:8000</code> or a cloud IP), the server incorporates FastAPI's <code>CORSMiddleware</code>:
        </p>
<pre><code>app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
</code></pre>
        <p>
            This enables pre-flight HTTP <code>OPTIONS</code> requests and allows browser fetch calls to succeed across different hostnames.
        </p>
    </section>
    """
