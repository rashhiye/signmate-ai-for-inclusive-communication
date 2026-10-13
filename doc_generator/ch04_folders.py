"""
Chapter 4: Project Folder Structure & Source Code Inspection
"""

def get_chapter_4():
    return """
    <section id="chapter-4" class="page-break">
        <h1>Chapter 4: Project Folder Structure & Source Code Inspection</h1>

        <h2>4.1 Verified Project Directory Tree</h2>
        <p>
            The tree below reflects the exact physical directory layout of the SignMate project inspected directly from the root workspace:
        </p>

        <pre><code>SignMate/
├── dist/                              # Compiled production build assets for Vercel deployment
├── public/                            # Static public web assets
│   ├── conversational_words.json      # 104 KB: Curated high-frequency English conversational words
│   ├── dictionary_words.json          # 1.19 MB: Comprehensive English dictionary dataset
│   ├── favicon.svg                    # SVG brand favicon for browser tabs
│   ├── icons.svg                      # Scalable SVG UI icon sprite sheet
│   └── signmate_labels.json           # 27 class mappings (0 = background/neutral, 1-26 = A-Z)
├── src/                               # React 19 + TypeScript Application Source Code
│   ├── ai/                            # Machine Learning and Computer Vision subsystems
│   │   ├── fastApiAIService.ts        # Client bridge for calling Python FastAPI backend
│   │   ├── fastApiConfig.ts           # Endpoint URLs, class labels, and localhost/LAN resolvers
│   │   └── handSignDetector.ts        # Dual-mode MediaPipe + MobileNetV3Small frame processor
│   ├── assets/                        # Static UI graphic assets (hero.png, logos)
│   ├── auth/                          # Authentication components (SocialAuthButtons.tsx)
│   ├── components/                    # Reusable UI component library
│   │   ├── ai/                        # AI overlay, landmark canvas, recognition panels
│   │   │   ├── AIControl.tsx          # Toggle switches for sign recognition
│   │   │   ├── HandLandmarkOverlay.tsx# Canvas overlay rendering 21 hand joints & skeletons
│   │   │   └── RecognitionPanel.tsx   # Visual output card showing letters & word chips
│   │   ├── brand/                     # Brand identity (SignMateLogo.tsx)
│   │   ├── user/                      # User dashboard navigation (UserSidebar.tsx)
│   │   ├── video/                     # Video call layout (VideoGrid, ParticipantTile, RoomHeader)
│   │   ├── Button.tsx                 # Accessible button component with variant states
│   │   ├── ErrorBoundary.tsx          # React error boundary catching runtime UI exceptions
│   │   ├── Modal.tsx                  # Accessible dialog modal component
│   │   └── Navbar.tsx                 # Global top navigation bar with auth status
│   ├── firebase/                      # Firebase Cloud Services SDK integration
│   │   ├── config.ts                  # App initialization for Auth, RTDB, and Firestore
│   │   ├── firebaseAuth.ts            # Email/Password & Google Sign-In authentication adapter
│   │   └── firestoreRooms.ts          # Firestore room creation, joining, and persistence adapter
│   ├── gemini/                        # Gemini Generative AI Language Assistance
│   │   ├── geminiConfig.ts            # Gemini proxy configuration schema
│   │   └── geminiSuggestionsService.ts# Planned Phase 5 language suggestion adapter
│   ├── hooks/                         # Custom React Hooks
│   │   ├── useAuth.tsx                # Context hook managing active user session
│   │   ├── useMediaDevices.ts         # Camera/microphone hardware permissions & track state
│   │   ├── useSignAI.ts               # Sign recognition state, debouncing, & speech synthesis
│   │   ├── useSocial.tsx              # Friends & social directory hook
│   │   └── useToast.tsx               # Non-blocking notification banner hook
│   ├── pages/                         # Application routes and views
│   │   ├── common/SecurityPage.tsx    # Platform privacy, encryption, & security audit page
│   │   ├── user/                      # User management views
│   │   │   ├── UserOfflineDetectionPage.tsx # Standalone offline sign practice & speech practice
│   │   │   ├── UserProfilePage.tsx    # User account settings and preferences
│   │   │   └── UserSupportPage.tsx    # Frequently asked questions & feedback mailer
│   │   ├── DashboardPage.tsx          # Post-login hub: create room, join room, offline mode
│   │   ├── LandingPage.tsx            # Marketing homepage, accessibility overview, feature showcase
│   │   ├── LoginPage.tsx              # User login screen with validation
│   │   ├── RegisterPage.tsx           # Account registration screen
│   │   └── RoomPage.tsx               # 74 KB: Core WebRTC 4-participant video conferencing room
│   ├── rooms/                         # Room modals (CreateRoomModal, JoinRoomModal)
│   ├── services/                      # Decoupled service layer
│   │   ├── AIService.ts               # Interface definition for AI recognition services
│   │   ├── AuthService.ts             # Interface definition for user authentication
│   │   ├── dictionaryService.ts       # 95,000-word prefix recommendation engine
│   │   ├── GeminiService.ts           # Abstract interface for generative completions
│   │   ├── RoomService.ts             # Interface definition for room lifecycle
│   │   └── WebRTCService.ts           # 26 KB: 3-tier signaling & 4-peer full mesh WebRTC engine
│   ├── types/                         # TypeScript interfaces (ai.ts, auth.ts, room.ts, video.ts)
│   ├── utils/                         # Helper utilities (a11y.ts, roomCode.ts, validators.ts)
│   ├── App.tsx                        # Main application router and root provider wrapper
│   ├── index.css                      # Global Tailwind CSS definitions & color tokens
│   └── main.tsx                       # React DOM root entrypoint
├── .env                               # Local environment variables (Firebase keys, API URLs)
├── database.rules.json                # Firebase Realtime Database security rules
├── dictionary_compact.json            # 22.4 MB: Source dictionary word dataset (95k+ terms)
├── fastapi_server.py                  # 11.8 KB: Production Python FastAPI AI inference microservice
├── firebase.json                      # Firebase project configuration manifest
├── firestore.rules                    # Cloud Firestore document security rules
├── package.json                       # Node dependencies (React 19, Vite 8, Firebase 12, Lucide)
├── signmate_labels.json               # Model class label dictionary (classes 0 to 26)
├── SignMate_MobileNetV3Small.tflite   # 3.88 MB: Converted TensorFlow Lite edge deployment model
├── SignMate_stage1_best.keras         # 5.27 MB: Trained MobileNetV3Small deep learning checkpoint
└── vite.config.ts                     # Vite build tool and plugin configuration
</code></pre>

        <h2>4.2 Critical File Breakdown & Responsibilities</h2>

        <h3>1. <code>fastapi_server.py</code> (11.8 KB)</h3>
        <p>
            <strong>Role:</strong> High-performance Python backend server powering real-time deep learning inference.<br>
            <strong>Why it exists:</strong> To load the heavy TensorFlow/Keras neural network (<code>SignMate_stage1_best.keras</code>) and execute hardware-accelerated tensor computations.<br>
            <strong>Key Functions:</strong>
        </p>
        <ul>
            <li><code>load_model_and_labels()</code>: Deserializes the Keras model using compatibility patches for legacy Keras 3 layers (<code>RandomContrast</code>, <code>Dense</code>) and parses <code>signmate_labels.json</code>.</li>
            <li><code>preprocess_image(image_bytes)</code>: Converts arbitrary image inputs into single-channel grayscale <code>[1, 160, 160, 1]</code> float32 arrays scaled between 0 and 255.</li>
            <li><code>POST /api/v1/predict/base64</code>: Receives base64 webcam frames, executes <code>model.predict()</code>, filters out background class 0, and returns predicted letters with top-5 confidence distributions.</li>
        </ul>

        <h3>2. <code>src/services/WebRTCService.ts</code> (26.3 KB)</h3>
        <p>
            <strong>Role:</strong> Core WebRTC video, audio, and subtitle communication engine.<br>
            <strong>Why it exists:</strong> Manages browser peer connections without paying for commercial video conferencing SDKs.<br>
            <strong>Key Functions:</strong>
        </p>
        <ul>
            <li><code>getOrCreatePeer(remoteId)</code>: Lazily instantiates and configures a dedicated <code>RTCPeerConnection</code> with Google STUN servers for every remote peer in the room.</li>
            <li><code>setupRealtimeDatabaseSignaling(roomId)</code>: Connects to Firebase Realtime Database at <code>rooms/{roomId}/mesh/{pairKey}</code> to exchange SDP offers, answers, and ICE candidates.</li>
            <li><code>sendLiveCaption(letter, text)</code>: Broadcasts real-time fingerspelled characters and accumulated sentences across peers via both WebSockets and BroadcastChannel.</li>
        </ul>

        <h3>3. <code>src/ai/handSignDetector.ts</code> (32.8 KB)</h3>
        <p>
            <strong>Role:</strong> Client-side computer vision orchestrator and fallback engine.<br>
            <strong>Why it exists:</strong> Connects video hardware to AI models while guaranteeing uninterrupted local operation if the Python server is offline.<br>
            <strong>Key Functions:</strong>
        </p>
        <ul>
            <li><code>initMediaPipe()</code>: Dynamically loads Google MediaPipe Hands from CDN to track hand coordinates.</li>
            <li><code>detectSign(video)</code>: Computes 1:1 square bounding boxes around the hand, crops the frame using an offscreen canvas, checks FastAPI health, and dispatches inference requests.</li>
            <li><code>classifyLandmarks(landmarks)</code>: 3D geometric rule engine that verifies finger angles and provides instant local fallback predictions if the neural network is unreachable.</li>
        </ul>

        <h3>4. <code>src/services/dictionaryService.ts</code> (6.1 KB)</h3>
        <p>
            <strong>Role:</strong> Ultra-fast in-memory vocabulary prediction engine.<br>
            <strong>Why it exists:</strong> Enables signers to fingerspell only the first 2–3 letters of a word (e.g., 'TH') and immediately select the full word ('THANK YOU') instead of laboriously signing every letter.<br>
            <strong>Key Functions:</strong>
        </p>
        <ul>
            <li><code>init()</code>: Asynchronously caches <code>conversational_words.json</code> into browser memory.</li>
            <li><code>getWordSuggestions(prefix, maxResults)</code>: Performs case-insensitive prefix tree matching, returning the top 8 conversational words in under 2 milliseconds.</li>
        </ul>

        <h3>5. <code>src/pages/RoomPage.tsx</code> (74.8 KB)</h3>
        <p>
            <strong>Role:</strong> The primary video conferencing view where users meet and communicate.<br>
            <strong>Why it exists:</strong> Assembles the video grid, participant tiles, call controls (mute, camera, screen share), live subtitle drawers, AI landmark overlays, and voice synthesis into a cohesive responsive layout.
        </p>

        <h2>4.3 End-to-End Execution Flow: Opening the Website & Joining a Call</h2>
        <ol>
            <li><strong>Initialization (<code>main.tsx</code> → <code>App.tsx</code>):</strong> The browser loads HTML/JS bundle from Vercel. <code>FirebaseApp</code> initializes Auth, Firestore, and RTDB singletons. React Router renders <code>LandingPage.tsx</code>.</li>
            <li><strong>Authentication Check (<code>useAuth.tsx</code>):</strong> The app verifies if an active session exists in <code>indexedDB</code>. If authenticated, the user accesses <code>DashboardPage.tsx</code>.</li>
            <li><strong>Room Navigation:</strong> The user enters room code <code>X8LN7A</code>. React Router navigates to <code>/room/X8LN7A</code>, mounting <code>RoomPage.tsx</code>.</li>
            <li><strong>Hardware Acquisition (<code>useMediaDevices.ts</code>):</strong> The browser prompts for camera and microphone permissions via <code>navigator.mediaDevices.getUserMedia({ video: true, audio: true })</code>. The resulting <code>MediaStream</code> is bound to <code>localVideoRef</code>.</li>
            <li><strong>Signaling & Mesh Establishment (<code>WebRTCService.ts</code>):</strong>
                <ul>
                    <li>The local client registers its unique ID (<code>peer_abc123</code>) in Firebase RTDB at <code>rooms/X8LN7A/peers/peer_abc123</code>.</li>
                    <li>If a peer (<code>peer_xyz789</code>) is already in the room, deterministic comparison initiates an SDP offer.</li>
                    <li>Both browsers exchange ICE candidates via RTDB and establish direct UDP media flow.</li>
                </ul>
            </li>
            <li><strong>Sign Recognition Activation (<code>useSignAI.ts</code>):</strong> The user enables "Sign AI". <code>handSignDetector.ts</code> begins analyzing video frames every 120ms, feeding hand crops to <code>fastapi_server.py</code> or MediaPipe, committing recognized letters, updating live subtitles, and speaking words through the speaker.</li>
        </ol>
    </section>
    """
