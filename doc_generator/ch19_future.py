"""
Chapter 19: Known Limitations & Future Roadmap
"""

def get_chapter_19():
    return """
    <section id="chapter-19" class="page-break">
        <h1>Chapter 19: Known Limitations & Future Roadmap</h1>

        <h2>19.1 Honest Technical Audit of Current Limitations</h2>
        <p>
            An exceptional project presentation acknowledges architectural boundaries transparently:
        </p>

        <table>
            <thead>
                <tr>
                    <th style="width: 25%;">Area</th>
                    <th style="width: 35%;">Current Reality / Limitation</th>
                    <th style="width: 40%;">Underlying Technical Cause</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Scope of Sign Vocabulary</strong></td>
                    <td>Static Alphabet Fingerspelling (A–Z + Neutral)</td>
                    <td>Trained on single-frame static images. Continuous natural signs require multi-frame temporal modeling (3D convolutions or Transformers).</td>
                </tr>
                <tr>
                    <td><strong>Signer Hand Dominance</strong></td>
                    <td>Optimized primarily for right-handed signers</td>
                    <td>Dataset samples predominantly feature right-hand gestures; left-handed mirroring requires dedicated augmentation or flip training.</td>
                </tr>
                <tr>
                    <td><strong>Network NAT Traversal</strong></td>
                    <td>Reliant on public STUN servers; lacks dedicated TURN</td>
                    <td>Direct P2P UDP packets may be dropped behind restrictive enterprise or university symmetric NATs without a paid TURN relay.</td>
                </tr>
                <tr>
                    <td><strong>Participant Scaling</strong></td>
                    <td>Hard capped at <strong>4 participants</strong> per room</td>
                    <td>Full mesh topology scales at $O(N^2)$ connections. Exceeding 4 participants causes CPU and upload bandwidth saturation on client devices.</td>
                </tr>
                <tr>
                    <td><strong>Lighting & Motion Sensitivity</strong></td>
                    <td>Degrades under extreme low-light or rapid hand motion</td>
                    <td>Consumer webcams introduce motion blur and sensor noise in dim conditions, altering boundary contours expected by MobileNet.</td>
                </tr>
            </tbody>
        </table>

        <h2>19.2 Future Architectural Roadmap</h2>
        <ol>
            <li><strong>Continuous ISL Sentence Translation:</strong> Replace single-frame image classification with a Video Vision Transformer (ViViT) or ConvLSTM model capable of processing continuous 30-frame video sequences, capturing movement trajectory, two-handed coordination, and facial grammar.</li>
            <li><strong>SFU (Selective Forwarding Unit) Architecture:</strong> Upgrade the WebRTC media layer from a full mesh to an SFU (e.g., MediaSoup, Pion, or LiveKit). An SFU allows each participant to upload only 1 video stream to a lightweight cloud router that duplicates and distributes packets, scaling rooms to 20+ participants effortlessly.</li>
            <li><strong>Dedicated Coturn Infrastructure:</strong> Provision containerized <code>coturn</code> relay servers on Google Cloud or AWS to guarantee 100% call establishment even behind strict corporate firewalls.</li>
            <li><strong>Multilingual Speech & Caption Synthesis:</strong> Expand voice output beyond English to regional Indian languages (Malayalam, Hindi, Tamil, Telugu) by piping recognized text through Google Cloud Translation and Indic-TTS engines.</li>
            <li><strong>On-Device WebAssembly / WebGPU Acceleration:</strong> Package the 3.88 MB TensorFlow Lite model directly into browser WebAssembly/WebGPU via TensorFlow.js or ONNX Runtime Web, achieving 100% client-side zero-backend deep learning execution.</li>
        </ol>
    </section>
    """
