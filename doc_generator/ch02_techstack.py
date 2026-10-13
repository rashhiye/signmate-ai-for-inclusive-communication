"""
Chapter 2: Complete Technology Stack
"""

def get_chapter_2():
    return """
    <section id="chapter-2" class="page-break">
        <h1>Chapter 2: Complete Technology Stack</h1>

        <h2>2.1 Comprehensive Technology Inventory & Status Table</h2>
        <p>
            The table below documents every core technology, tool, library, and service evaluated and utilized within the SignMate project. Every component is classified according to its verified operational status in the repository.
        </p>

        <table>
            <thead>
                <tr>
                    <th style="width: 14%;">Technology</th>
                    <th style="width: 16%;">Purpose & Role</th>
                    <th style="width: 16%;">Where It Is Used</th>
                    <th style="width: 18%;">Why Selected</th>
                    <th style="width: 18%;">Communication Link</th>
                    <th style="width: 18%;">Current Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>React 19</strong></td>
                    <td>Frontend UI Library</td>
                    <td>Entire Web Client (<code>src/</code>)</td>
                    <td>Modern declarative component-based UI, efficient Virtual DOM reconciliation, seamless state hooks.</td>
                    <td>Renders DOM, binds event listeners, interacts with WebRTC and AI services via custom hooks.</td>
                    <td><span class="badge badge-verified">Implemented & Verified</span> Active in production build.</td>
                </tr>
                <tr>
                    <td><strong>TypeScript 5/6</strong></td>
                    <td>Static Typing & Code Safety</td>
                    <td>All source scripts (<code>.ts, .tsx</code>)</td>
                    <td>Catches type mismatches at compile time, ensures reliable data contracts across WebRTC and AI layers.</td>
                    <td>Transpiled by Vite/ESBuild into clean standard JavaScript for browser runtime execution.</td>
                    <td><span class="badge badge-verified">Implemented & Verified</span> Strict typing enforced.</td>
                </tr>
                <tr>
                    <td><strong>Vite 8</strong></td>
                    <td>Frontend Build Tool & Dev Server</td>
                    <td>Root build pipeline (<code>vite.config.ts</code>)</td>
                    <td>Lightning-fast Hot Module Replacement (HMR) and optimized Rollup-based production bundling.</td>
                    <td>Serves client assets on port 5173 locally; compiles static artifacts into <code>dist/</code> for Vercel.</td>
                    <td><span class="badge badge-verified">Implemented & Verified</span> Production builds functional.</td>
                </tr>
                <tr>
                    <td><strong>Tailwind CSS 3</strong></td>
                    <td>Utility-First Styling</td>
                    <td>Entire UI layout & components</td>
                    <td>Rapid responsive styling, consistent dark-mode design system, zero runtime style overhead.</td>
                    <td>Compiled into atomic CSS classes at build time by PostCSS.</td>
                    <td><span class="badge badge-verified">Implemented & Verified</span> Active across all pages.</td>
                </tr>
                <tr>
                    <td><strong>WebRTC (Native Browser API)</strong></td>
                    <td>P2P Audio/Video/Data Communication</td>
                    <td><code>src/services/WebRTCService.ts</code>, <code>RoomPage.tsx</code></td>
                    <td>Zero-plugin browser standard, sub-second latency, hardware-accelerated VP8/H.264 video pipelines.</td>
                    <td>Direct peer-to-peer UDP media exchange between participant browsers via ICE/DTLS/SRTP.</td>
                    <td><span class="badge badge-verified">Implemented & Verified</span> 4-peer full mesh active.</td>
                </tr>
                <tr>
                    <td><strong>Firebase Realtime Database (RTDB)</strong></td>
                    <td>WebRTC Signaling & Room State Sync</td>
                    <td><code>WebRTCService.ts</code>, <code>config.ts</code></td>
                    <td>Millisecond-latency WebSocket synchronization for SDP offers, answers, and ICE candidate exchange.</td>
                    <td>Browser connects to Google cloud servers via secure WSS to read/write ephemeral signaling paths.</td>
                    <td><span class="badge badge-verified">Implemented & Verified</span> Multi-peer signaling active.</td>
                </tr>
                <tr>
                    <td><strong>Firebase Authentication</strong></td>
                    <td>User Identity & Session Management</td>
                    <td><code>src/firebase/firebaseAuth.ts</code>, <code>LoginPage.tsx</code></td>
                    <td>Secure credential storage, token management, OAuth support, zero backend auth maintenance.</td>
                    <td>Frontend talks to Google Identity Toolkit REST API; maintains client auth state tokens.</td>
                    <td><span class="badge badge-verified">Implemented & Verified</span> Email/password & Google login.</td>
                </tr>
                <tr>
                    <td><strong>Cloud Firestore</strong></td>
                    <td>NoSQL Document Database</td>
                    <td><code>src/firebase/firestoreRooms.ts</code></td>
                    <td>Persistent storage for user profiles and registered meeting rooms.</td>
                    <td>Client SDK communicates directly with Google Firestore endpoints using secure rules.</td>
                    <td><span class="badge badge-verified">Implemented & Verified</span> Active for room persistence.</td>
                </tr>
                <tr>
                    <td><strong>MobileNetV3Small (Keras / TensorFlow)</strong></td>
                    <td>Deep Learning Sign Classifier</td>
                    <td><code>SignMate_stage1_best.keras</code>, <code>fastapi_server.py</code></td>
                    <td>State-of-the-art mobile computer vision architecture; high efficiency (~1.17M params), high accuracy.</td>
                    <td>Accepts [1, 160, 160, 1] input from image crop; outputs 27-element probability vector.</td>
                    <td><span class="badge badge-verified">Implemented & Verified</span> 97% test accuracy checkpoint.</td>
                </tr>
                <tr>
                    <td><strong>TensorFlow Lite (TFLite)</strong></td>
                    <td>Edge Runtime ML Model</td>
                    <td><code>SignMate_MobileNetV3Small.tflite</code></td>
                    <td>Compact (3.88 MB) flatbuffer model optimized for low-latency, low-memory embedded inference.</td>
                    <td>Loaded directly via TensorFlow Lite runtime on CPU/GPU delegates.</td>
                    <td><span class="badge badge-verified">Implemented & Verified</span> Exported & validated (3.88 MB).</td>
                </tr>
                <tr>
                    <td><strong>FastAPI & Uvicorn (Python 3.12/3.13)</strong></td>
                    <td>High-Performance ML Inference Microservice</td>
                    <td><code>fastapi_server.py</code></td>
                    <td>Asynchronous, lightweight Python web framework; handles numpy tensors and model execution.</td>
                    <td>Exposes REST endpoints (<code>/api/v1/predict</code>, <code>/api/v1/health</code>) accessed via HTTP POST.</td>
                    <td><span class="badge badge-verified">Implemented & Verified</span> Serves local predictions.</td>
                </tr>
                <tr>
                    <td><strong>Google MediaPipe Hands</strong></td>
                    <td>Hand Localization & 21 3D Landmarks</td>
                    <td><code>src/ai/handSignDetector.ts</code>, <code>HandLandmarkOverlay.tsx</code></td>
                    <td>Real-time hand tracking; computes square bounding boxes and validates anatomical finger states.</td>
                    <td>Runs client-side in browser; provides ROI crop fed into neural network.</td>
                    <td><span class="badge badge-verified">Implemented & Verified</span> Client-side tracking active.</td>
                </tr>
                <tr>
                    <td><strong>Dictionary Recommendation Engine</strong></td>
                    <td>Contextual Vocabulary Assistance</td>
                    <td><code>src/services/dictionaryService.ts</code>, <code>conversational_words.json</code></td>
                    <td>High-speed prefix tree lookup across 95,000+ words; prioritizes common conversational terms.</td>
                    <td>In-memory JavaScript search executed synchronously on client thread (&lt;2ms).</td>
                    <td><span class="badge badge-verified">Implemented & Verified</span> 95k word dictionary active.</td>
                </tr>
                <tr>
                    <td><strong>Google Gemini API</strong></td>
                    <td>Generative Language Completion Proxy</td>
                    <td><code>src/gemini/geminiSuggestionsService.ts</code></td>
                    <td>Designed for sentence-level conversational auto-completion from recognized sign sequences.</td>
                    <td>Intended to be proxied through secure backend to shield API keys from browser client.</td>
                    <td><span class="badge badge-partial">Partially Implemented (Phase 5)</span> Interface defined; pending proxy.</td>
                </tr>
                <tr>
                    <td><strong>Vercel Edge Network</strong></td>
                    <td>Global CDN Hosting Platform</td>
                    <td>Production Web Deployment</td>
                    <td>Zero-configuration Git CI/CD, automatic HTTPS, global edge distribution, ultra-fast TTFB.</td>
                    <td>Delivers static HTML, CSS, JavaScript, and asset bundles to web visitors.</td>
                    <td><span class="badge badge-verified">Implemented & Verified</span> Live at signmate-ashy.vercel.app.</td>
                </tr>
            </tbody>
        </table>

        <h2>2.2 Architectural Taxonomy: Distinguishing Core Computing Concepts</h2>
        <p>
            During project viva examinations, candidates are frequently asked to define and contrast computing terminology. The following definitions clarify how these layers function in SignMate:
        </p>

        <div class="note-box">
            <ul style="margin-left: 15px; margin-bottom: 0;">
                <li><strong>Framework (e.g., FastAPI):</strong> A foundational software environment providing an architectural skeleton. It controls the application flow (Inversion of Control—<em>"the framework calls your code"</em>). FastAPI dictates how routing, dependency injection, and middleware operate.</li>
                <li><strong>Library (e.g., React, Lucide Icons):</strong> A curated collection of pre-written functions and classes that you call directly from your code (<em>"your code calls the library"</em>). React provides UI component primitives without dictating your entire backend architecture.</li>
                <li><strong>API (Application Programming Interface, e.g., <code>/api/v1/predict</code>, Web Speech API):</strong> A formalized contract of endpoints, methods, and schemas enabling two distinct software components to communicate.</li>
                <li><strong>Protocol (e.g., WebRTC, HTTP/HTTPS, WebSocket):</strong> A standardized set of network rules governing data serialization, formatting, error-checking, and transmission across communication links.</li>
                <li><strong>Database (e.g., Firebase RTDB, Cloud Firestore):</strong> An organized, queryable persistence engine capable of storing, indexing, and retrieving structured application records.</li>
                <li><strong>Model (e.g., MobileNetV3Small):</strong> A trained mathematical artifact consisting of neural layer topologies and numerical weight matrices that maps input features to predicted output probabilities.</li>
                <li><strong>Hosting Platform (e.g., Vercel):</strong> Cloud server infrastructure that stores compiled website artifacts, executes domain routing, issues SSL certificates, and serves files over high-speed CDNs.</li>
            </ul>
        </div>

        <h2>2.3 Why a Web Application Over a Flutter Mobile App?</h2>
        <p>
            An earlier iteration of this project investigated Flutter. However, the final production implementation was deliberately migrated to a modern React 19 web application for vital academic and practical reasons:
        </p>
        <ol>
            <li><strong>Zero-Barrier Instant Accessibility:</strong> A Deaf user or hearing caller does not need to download an APK, install third-party stores, or grant OS-level installation privileges. They simply click a link (<code>signmate-ashy.vercel.app/room/X8LN7A</code>) and join instantly.</li>
            <li><strong>Cross-Platform Universal Compatibility:</strong> A web application runs identically across Windows, macOS, Linux, Android, iOS, ChromeOS, and Smart Displays without compiling separate native toolchains (Xcode, Android Gradle).</li>
            <li><strong>Immediate Continuous Deployment:</strong> Bug fixes, UI updates, and dictionary enhancements pushed to Git are live on Vercel in 45 seconds, requiring zero app-store review delays or manual user updates.</li>
            <li><strong>Web Standards Integration:</strong> Modern browsers natively support WebRTC, WebGL, Web Audio, and Web Speech APIs without wrapping them in fragile mobile plugin bridges.</li>
        </ol>

        <h2>2.4 What Vercel Hosts vs. Where the Python Backend Runs</h2>
        <div class="alert-box">
            <div class="alert-box-title">CRITICAL EXAM UNDERSTANDING: DEPLOYMENT SEPARATION</div>
            <p style="margin-bottom: 6px;">
                <strong>Vercel hosts the static frontend build artifacts:</strong> the compiled HTML, CSS, JavaScript chunks, images, and static dictionaries (<code>conversational_words.json</code>). Vercel is a serverless static/Node CDN platform. It <em>does not</em> run long-running Python processes or host heavy GPU TensorFlow inference servers.
            </p>
            <p style="margin-bottom: 0;">
                <strong>Where does the Python FastAPI backend run?</strong> The FastAPI backend (<code>fastapi_server.py</code>) runs on a host machine (e.g., local workstation, Docker container, or virtual private server such as Render, AWS EC2, or Railway) listening on port <code>8000</code>. When users access the live Vercel website without a live connected Python server, SignMate seamlessly falls back to client-side Google MediaPipe landmark processing and client-side dictionary assistance, ensuring the website never crashes or displays a blank screen.
            </p>
        </div>
    </section>
    """
