"""
Chapter 3: System Architecture & Data Flows
"""

def get_chapter_3():
    return """
    <section id="chapter-3" class="page-break">
        <h1>Chapter 3: System Architecture & Data Flows</h1>

        <h2>3.1 High-Level End-to-End System Architecture</h2>
        <p>
            SignMate employs a distributed, decoupled multi-tier architecture designed for low latency, fault tolerance, and universal web accessibility. The system separates the user presentation, real-time media transport, signaling coordination, and machine learning inference into independent subsystems.
        </p>

        <div class="diagram-container">
            <svg viewBox="0 0 850 420" width="100%" height="auto" style="max-height: 380px;" xmlns="http://www.w3.org/2000/svg">
                <!-- Background -->
                <rect width="850" height="420" fill="#f8fafc" rx="8" />

                <!-- Tier 1: Client Browser -->
                <rect x="20" y="20" width="260" height="380" fill="#ffffff" stroke="#2563eb" stroke-width="2" rx="6" />
                <text x="150" y="45" font-family="Inter, sans-serif" font-size="13" font-weight="bold" fill="#1e3a8a" text-anchor="middle">CLIENT BROWSER (Vercel CDN)</text>
                
                <rect x="35" y="65" width="230" height="45" fill="#eff6ff" stroke="#93c5fd" rx="4" />
                <text x="150" y="85" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="#1e40af" text-anchor="middle">React 19 UI & Pages</text>
                <text x="150" y="100" font-family="Inter, sans-serif" font-size="8.5" fill="#475569" text-anchor="middle">LandingPage, RoomPage, Dashboard</text>

                <rect x="35" y="125" width="230" height="50" fill="#eff6ff" stroke="#93c5fd" rx="4" />
                <text x="150" y="145" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="#1e40af" text-anchor="middle">WebRTC Engine (WebRTCService)</text>
                <text x="150" y="162" font-family="Inter, sans-serif" font-size="8.5" fill="#475569" text-anchor="middle">RTCPeerConnection Mesh & MediaStream</text>

                <rect x="35" y="190" width="230" height="50" fill="#eff6ff" stroke="#93c5fd" rx="4" />
                <text x="150" y="210" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="#1e40af" text-anchor="middle">MediaPipe Landmark Engine</text>
                <text x="150" y="227" font-family="Inter, sans-serif" font-size="8.5" fill="#475569" text-anchor="middle">Hand Bounding Box & 21 3D Landmarks</text>

                <rect x="35" y="255" width="230" height="45" fill="#eff6ff" stroke="#93c5fd" rx="4" />
                <text x="150" y="275" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="#1e40af" text-anchor="middle">Temporal Smoothing & Debouncing</text>
                <text x="150" y="290" font-family="Inter, sans-serif" font-size="8.5" fill="#475569" text-anchor="middle">Confidence & Hold Count Verification</text>

                <rect x="35" y="315" width="230" height="45" fill="#eff6ff" stroke="#93c5fd" rx="4" />
                <text x="150" y="335" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="#1e40af" text-anchor="middle">Dictionary Recommendation Service</text>
                <text x="150" y="350" font-family="Inter, sans-serif" font-size="8.5" fill="#475569" text-anchor="middle">95,000+ Words Prefix Tree Search</text>

                <rect x="35" y="370" width="230" height="22" fill="#dcfce7" stroke="#86efac" rx="3" />
                <text x="150" y="384" font-family="Inter, sans-serif" font-size="8.5" font-weight="bold" fill="#166534" text-anchor="middle">Web Speech API (Text-to-Speech)</text>

                <!-- Tier 2: Cloud Services (Firebase) -->
                <rect x="310" y="20" width="240" height="180" fill="#ffffff" stroke="#f59e0b" stroke-width="2" rx="6" />
                <text x="430" y="45" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#b45309" text-anchor="middle">FIREBASE CLOUD SERVICES</text>

                <rect x="325" y="65" width="210" height="35" fill="#fffbeb" stroke="#fde68a" rx="4" />
                <text x="430" y="86" font-family="Inter, sans-serif" font-size="9.5" font-weight="bold" fill="#92400e" text-anchor="middle">Firebase Authentication</text>

                <rect x="325" y="110" width="210" height="40" fill="#fffbeb" stroke="#fde68a" rx="4" />
                <text x="430" y="128" font-family="Inter, sans-serif" font-size="9.5" font-weight="bold" fill="#92400e" text-anchor="middle">Firebase Realtime DB (Signaling)</text>
                <text x="430" y="142" font-family="Inter, sans-serif" font-size="8" fill="#78350f" text-anchor="middle">SDP Offer/Answer & ICE Candidates</text>

                <rect x="325" y="160" width="210" height="30" fill="#fffbeb" stroke="#fde68a" rx="4" />
                <text x="430" y="180" font-family="Inter, sans-serif" font-size="9.5" font-weight="bold" fill="#92400e" text-anchor="middle">Cloud Firestore (Rooms/Users)</text>

                <!-- Tier 3: AI Inference Server (Python FastAPI) -->
                <rect x="310" y="220" width="240" height="180" fill="#ffffff" stroke="#10b981" stroke-width="2" rx="6" />
                <text x="430" y="245" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#047857" text-anchor="middle">AI INFERENCE BACKEND</text>

                <rect x="325" y="260" width="210" height="35" fill="#ecfdf5" stroke="#a7f3d0" rx="4" />
                <text x="430" y="280" font-family="Inter, sans-serif" font-size="9.5" font-weight="bold" fill="#065f46" text-anchor="middle">FastAPI REST Server (:8000)</text>

                <rect x="325" y="305" width="210" height="40" fill="#ecfdf5" stroke="#a7f3d0" rx="4" />
                <text x="430" y="323" font-family="Inter, sans-serif" font-size="9.5" font-weight="bold" fill="#065f46" text-anchor="middle">SignMate_MobileNetV3Small</text>
                <text x="430" y="337" font-family="Inter, sans-serif" font-size="8" fill="#047857" text-anchor="middle">.keras Checkpoint / .tflite Runtime</text>

                <rect x="325" y="355" width="210" height="35" fill="#ecfdf5" stroke="#a7f3d0" rx="4" />
                <text x="430" y="375" font-family="Inter, sans-serif" font-size="9" font-weight="bold" fill="#065f46" text-anchor="middle">Grayscale Preprocessor [1,160,160,1]</text>

                <!-- Tier 4: Remote WebRTC Peers -->
                <rect x="580" y="20" width="250" height="380" fill="#ffffff" stroke="#8b5cf6" stroke-width="2" rx="6" />
                <text x="705" y="45" font-family="Inter, sans-serif" font-size="13" font-weight="bold" fill="#5b21b6" text-anchor="middle">REMOTE PARTICIPANTS (1-3)</text>

                <rect x="595" y="70" width="220" height="85" fill="#f5f3ff" stroke="#ddd6fe" rx="4" />
                <text x="705" y="95" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="#6d28d9" text-anchor="middle">Participant 2 (Browser Peer)</text>
                <text x="705" y="115" font-family="Inter, sans-serif" font-size="8.5" fill="#4c1d95" text-anchor="middle">Direct P2P Audio / Video / Captions</text>
                <text x="705" y="135" font-family="Inter, sans-serif" font-size="8" fill="#5b21b6" text-anchor="middle">WebRTC DataChannel Subtitles</text>

                <rect x="595" y="175" width="220" height="85" fill="#f5f3ff" stroke="#ddd6fe" rx="4" />
                <text x="705" y="200" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="#6d28d9" text-anchor="middle">Participant 3 (Browser Peer)</text>
                <text x="705" y="220" font-family="Inter, sans-serif" font-size="8.5" fill="#4c1d95" text-anchor="middle">Independent PeerConnection</text>

                <rect x="595" y="280" width="220" height="85" fill="#f5f3ff" stroke="#ddd6fe" rx="4" />
                <text x="705" y="305" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="#6d28d9" text-anchor="middle">Participant 4 (Browser Peer)</text>
                <text x="705" y="325" font-family="Inter, sans-serif" font-size="8.5" fill="#4c1d95" text-anchor="middle">Encrypted SRTP Media Exchange</text>

                <!-- Arrows -->
                <!-- Client to Firebase -->
                <path d="M 280 145 L 325 145" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow)" />
                <text x="302" y="138" font-family="Inter, sans-serif" font-size="7" fill="#b45309" text-anchor="middle">Signaling</text>

                <!-- Client to FastAPI -->
                <path d="M 280 275 L 325 275" stroke="#10b981" stroke-width="2" />
                <text x="302" y="270" font-family="Inter, sans-serif" font-size="7" fill="#047857" text-anchor="middle">Inference</text>

                <!-- Client to Remote Peers (Direct P2P Media) -->
                <path d="M 280 160 C 400 160, 480 90, 595 90" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="4,4" />
                <path d="M 280 160 C 400 160, 480 200, 595 200" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="4,4" />
                <path d="M 280 160 C 400 160, 480 310, 595 310" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="4,4" />
                <text x="430" y="10" font-family="Inter, sans-serif" font-size="8" font-weight="bold" fill="#6d28d9" text-anchor="middle">DIRECT P2P MEDIA PLANE (SRTP Audio/Video)</text>
            </svg>
            <div class="diagram-caption">Figure 3.1: SignMate End-to-End System Architecture Diagram</div>
        </div>

        <h2>3.2 Component Responsibility Table</h2>
        <table>
            <thead>
                <tr>
                    <th style="width: 25%;">Component</th>
                    <th style="width: 25%;">Primary Responsibility</th>
                    <th style="width: 25%;">Inputs</th>
                    <th style="width: 25%;">Outputs</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>React Frontend (<code>src/</code>)</strong></td>
                    <td>Renders responsive UI, captures webcam/microphone streams, manages call layout, triggers speech synthesis.</td>
                    <td>User interactions, camera hardware frames, remote media streams.</td>
                    <td>Rendered DOM, canvas crops, local media tracks, speech synthesis utterances.</td>
                </tr>
                <tr>
                    <td><strong>WebRTC Service (<code>WebRTCService.ts</code>)</strong></td>
                    <td>Coordinates peer connections, handles SDP offer/answer exchange, manages ICE candidates, broadcasts live sign subtitles.</td>
                    <td>Room ID, local MediaStream, signaling messages from Firebase RTDB.</td>
                    <td>Encrypted P2P video/audio tracks, remote streams, real-time message events.</td>
                </tr>
                <tr>
                    <td><strong>Hand Sign Detector (<code>handSignDetector.ts</code>)</strong></td>
                    <td>Tracks hand regions using MediaPipe, calculates 1:1 square bounding box, dispatches inference to FastAPI or executes geometric fallback.</td>
                    <td>HTMLVideoElement raw camera frames.</td>
                    <td>Bounding box, 21 landmarks, detected letter, confidence score, inference latency.</td>
                </tr>
                <tr>
                    <td><strong>FastAPI Microservice (<code>fastapi_server.py</code>)</strong></td>
                    <td>Loads <code>SignMate_stage1_best.keras</code>, normalizes incoming image frames to [1, 160, 160, 1] float32 grayscale, executes prediction.</td>
                    <td>Base64 JPEG or multipart image frames.</td>
                    <td>Predicted class index (0–26), letter label ('A'–'Z' or ''), confidence, top-5 probabilities.</td>
                </tr>
                <tr>
                    <td><strong>Dictionary Service (<code>dictionaryService.ts</code>)</strong></td>
                    <td>Maintains in-memory vocabulary (95,000+ words), provides instant prefix-filtered word suggestions, prioritizes conversational phrases.</td>
                    <td>Recognized character buffer prefix (e.g., 'HEL').</td>
                    <td>Array of recommended words (e.g., ['HELLO', 'HELP', 'HEALTH']).</td>
                </tr>
                <tr>
                    <td><strong>Firebase Authentication</strong></td>
                    <td>Authenticates users, encrypts passwords, issues JWT access tokens, persists user sessions across browser reloads.</td>
                    <td>User email, password, or Google OAuth credentials.</td>
                    <td>Authenticated User object, UID, display name, session tokens.</td>
                </tr>
                <tr>
                    <td><strong>Firebase Realtime Database</strong></td>
                    <td>Serves as the high-speed signaling bus for WebRTC connection establishment and room presence tracking.</td>
                    <td>SDP offers, SDP answers, ICE candidates, disconnect hooks.</td>
                    <td>Real-time synchronization events pushed to connected peers.</td>
                </tr>
            </tbody>
        </table>

        <h2>3.3 Five Core Data-Flow Scenarios</h2>

        <h3>A. User Registration and Login Flow</h3>
        <p>
            1. The user navigates to <code>/register</code> or <code>/login</code> and submits their credentials (email and password) or selects Google Sign-In.<br>
            2. <code>firebaseAuth.ts</code> invokes <code>signInWithEmailAndPassword()</code> or <code>signInWithPopup()</code> directly via HTTPS to Google Identity Toolkit.<br>
            3. Firebase verifies credentials, generates a cryptographically signed JWT token, and caches it in browser <code>indexedDB</code>.<br>
            4. The React <code>useAuth()</code> hook updates the application state, dismissing login loaders and redirecting the user to <code>/dashboard</code>.
        </p>

        <h3>B. Creating and Joining a Video Room</h3>
        <p>
            1. On the dashboard, a user clicks "Create Room". <code>firestoreRooms.ts</code> generates a 6-character room code (e.g., <code>X8LN7A</code>) and writes a document to Firestore under <code>rooms/X8LN7A</code>.<br>
            2. The creator is routed to <code>/room/X8LN7A</code>. The browser activates <code>navigator.mediaDevices.getUserMedia()</code> to acquire the local camera and microphone.<br>
            3. A second user enters <code>X8LN7A</code> into the "Join Room" modal. The app queries Firestore to verify room existence and check that participant capacity has not exceeded the 4-participant limit.<br>
            4. Both users now share the same room identifier in Firebase Realtime Database.
        </p>

        <h3>C. Four-Participant Video Call (Full Mesh)</h3>
        <p>
            1. As each participant joins, their client registers their unique peer ID in RTDB at <code>rooms/X8LN7A/peers/{clientId}</code>.<br>
            2. When 4 users are present (Users A, B, C, D), deterministic ordering (<code>clientId_A &lt; clientId_B</code>) determines who initiates the offer.<br>
            3. Each participant establishes 3 separate <code>RTCPeerConnection</code> instances, resulting in exactly $N(N-1)/2 = 6$ direct peer-to-peer media links.<br>
            4. Audio and video streams flow directly between browsers over UDP; no media data passes through Vercel or Firebase servers.
        </p>

        <h3>D. AI Sign Recognition Pipeline</h3>
        <p>
            1. In an active call, the user turns on the "Sign AI" toggle button. The <code>useSignAI</code> hook triggers a 120ms frame evaluation loop.<br>
            2. Google MediaPipe Hands scans the video frame. If a hand is visible, it extracts 21 3D landmarks and calculates a 1:1 square bounding box.<br>
            3. An offscreen 160×160 canvas crops the hand, converts it to grayscale, and dispatches a lightweight JSON payload to <code>fastapi_server.py</code>.<br>
            4. The neural network computes a forward pass, outputting 27 class scores. If confidence exceeds 0.70 and is stable across 2 consecutive frames, the letter is committed.<br>
            5. The recognized letter is broadcasted to all participants via WebRTC data channels and converted to speech via <code>window.speechSynthesis</code>.
        </p>

        <h3>E. Language / Dictionary Suggestions Flow</h3>
        <p>
            1. As letters are committed (e.g., 'H', then 'E', then 'L'), <code>dictionaryService.ts</code> reads the active prefix.<br>
            2. In less than 2 milliseconds, the client-side prefix matcher queries <code>dictionary_words.json</code> and prioritizes high-frequency conversational terms from <code>conversational_words.json</code>.<br>
            3. The UI presents clickable suggestion chips (e.g., [HELLO], [HELP], [HEALTH]).<br>
            4. Clicking a chip replaces the partial fingerspelled sequence with the complete word and appends a space, ready for the next word.
        </p>

        <h2>3.4 Control Plane vs. Media Plane (Simple Examiner Explanation)</h2>
        <div class="note-box">
            <div class="note-box-title">VIVA ESSENTIAL: CONTROL PLANE VS. MEDIA PLANE</div>
            <p>
                <strong>The Control Plane (Signaling):</strong> Responsible for setting up, coordinating, and terminating the call. It handles <em>lightweight metadata</em>: who wants to talk to whom, what codecs are supported (SDP offers/answers), and what public IP addresses are available (ICE candidates). In SignMate, the control plane runs over Firebase Realtime Database and WebSockets.
            </p>
            <p style="margin-bottom: 0;">
                <strong>The Media Plane (Audio/Video Transport):</strong> Responsible for transmitting the actual, heavy video and audio packets. Once the control plane finishes exchanging IP addresses and cryptographic keys, media flows <em>directly between user browsers</em> using the Secure Real-Time Transport Protocol (SRTP) over UDP. No media data touches the web server.
            </p>
        </div>
    </section>
    """
