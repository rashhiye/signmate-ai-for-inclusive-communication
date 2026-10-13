"""
Chapter 16: Security, Privacy, Ethics & Accessibility
"""

def get_chapter_16():
    return """
    <section id="chapter-16" class="page-break">
        <h1>Chapter 16: Security, Privacy, Ethics & Accessibility</h1>

        <h2>16.1 Security Architecture & Transit Encryption</h2>
        <p>
            SignMate implements a multi-layered security model protecting user identity, device hardware, and media streams:
        </p>

        <table>
            <thead>
                <tr>
                    <th style="width: 25%;">Security Layer</th>
                    <th style="width: 35%;">Mechanism & Protocol</th>
                    <th style="width: 40%;">Threat Mitigated</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Hardware Permissions</strong></td>
                    <td>Browser Permission Sandbox (<code>getUserMedia</code>)</td>
                    <td>Prevents unauthorized eavesdropping or background camera access.</td>
                </tr>
                <tr>
                    <td><strong>Web Delivery</strong></td>
                    <td>HTTPS with TLS 1.3 Encryption</td>
                    <td>Eliminates Man-in-the-Middle (MitM) attacks and code tampering.</td>
                </tr>
                <tr>
                    <td><strong>Media Plane Transport</strong></td>
                    <td>DTLS-SRTP (Datagram TLS + Secure RTP)</td>
                    <td>Guarantees that video, audio, and sign subtitle streams cannot be intercepted on intermediate Wi-Fi routers.</td>
                </tr>
                <tr>
                    <td><strong>Control Plane Signaling</strong></td>
                    <td>WSS (Secure WebSockets over SSL) to Google RTDB</td>
                    <td>Prevents eavesdropping on SDP offers/answers and session tokens.</td>
                </tr>
                <tr>
                    <td><strong>User Authentication</strong></td>
                    <td>Firebase Auth with bcrypt-hashed credentials & JWTs</td>
                    <td>Protects against credential harvesting and session hijacking.</td>
                </tr>
                <tr>
                    <td><strong>Backend Validation</strong></td>
                    <td>Pydantic schemas & strict regex validation</td>
                    <td>Prevents buffer overflows, malformed base64 injection, and DoS attacks.</td>
                </tr>
            </tbody>
        </table>

        <h2>16.2 Privacy Policy: Ephemeral In-Memory Image Processing</h2>
        <div class="note-box">
            <div class="note-box-title">ZERO PERSISTENCE IMAGE POLICY</div>
            <p style="margin-bottom: 0;">
                A major privacy concern in video and AI platforms is whether user camera images are retained on remote servers. SignMate operates on a strict <strong>Zero Data Retention (ZDR)</strong> architecture: incoming video frames are converted into in-memory byte buffers in RAM, passed through the model forward pass, and immediately discarded by the Python garbage collector. <strong>Zero user photos, video clips, or biometric data are ever written to hard drives or cloud databases.</strong>
            </p>
        </div>

        <h2>16.3 Ethical AI Guidelines & Avoiding Exaggerated Claims</h2>
        <div class="alert-box">
            <div class="alert-box-title">ACADEMIC INTEGRITY IN AI PRESENTATIONS</div>
            <p>
                <strong>1. Ethical Representation of Sign Language:</strong> It is unethical and academically dishonest to describe an alphabet classifier as a "complete Indian Sign Language translator". Natural ISL relies heavily on facial expressions (grammatical non-manual markers), two-handed compound gestures, and 3D spatial references. SignMate honestly positions itself as an <em>assistive fingerspelling recognition tool</em> that bridges communication gaps.
            </p>
            <p style="margin-bottom: 0;">
                <strong>2. Skin Tone Fairness via Grayscale Normalization:</strong> Many computer vision datasets over-represent fair skin tones. By converting incoming webcam crops into single-channel luminance grayscale, SignMate strips away racial and skin-tone color variations, focusing solely on geometric hand contours and finger edges.
            </p>
        </div>

        <h2>16.4 Accessibility Standards (WCAG 2.1 AA Compliance)</h2>
        <p>
            Because SignMate is engineered for the Deaf and Hard-of-Hearing community, accessibility is integrated directly into the component system:
        </p>
        <ul>
            <li><strong>Screen Reader Live Regions (<code>src/utils/a11y.ts</code>):</strong> Dynamic events (e.g., <em>"Letter H recognized"</em>, <em>"Sign recognition enabled"</em>, <em>"Partner joined"</em>) are automatically announced to screen readers using ARIA live regions without interrupting navigation focus.</li>
            <li><strong>High-Contrast Non-Glare Dark Theme:</strong> High contrast palette (<code>#121824</code> background with crisp white typography and vivid cyan/blue accents) minimizes eye fatigue during prolonged video calls.</li>
            <li><strong>Keyboard Accessibility:</strong> All buttons, modals, and sliders are fully operable using standard <code>Tab</code>, <code>Enter</code>, <code>Space</code>, and <code>Escape</code> key commands with visible focus outlines.</li>
        </ul>
    </section>
    """
