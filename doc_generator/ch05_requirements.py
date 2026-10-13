"""
Chapter 5: Requirements, Use Cases & Workflow Modeling
"""

def get_chapter_5():
    return """
    <section id="chapter-5" class="page-break">
        <h1>Chapter 5: Requirements, Use Cases & Workflow Modeling</h1>

        <h2>5.1 Functional Requirements (FR)</h2>
        <table>
            <thead>
                <tr>
                    <th style="width: 12%;">Req ID</th>
                    <th style="width: 25%;">Requirement Description</th>
                    <th style="width: 20%;">Target Component</th>
                    <th style="width: 20%;">Verification Status</th>
                    <th style="width: 23%;">Acceptance Criteria</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>FR-01</strong></td>
                    <td>User Account Registration & Login</td>
                    <td><code>firebaseAuth.ts</code>, <code>LoginPage.tsx</code></td>
                    <td><span class="badge badge-verified">Implemented & Verified</span></td>
                    <td>Users can register with email/password or Google OAuth; sessions persist across reloads.</td>
                </tr>
                <tr>
                    <td><strong>FR-02</strong></td>
                    <td>Room Creation with Unique Code</td>
                    <td><code>firestoreRooms.ts</code>, <code>DashboardPage.tsx</code></td>
                    <td><span class="badge badge-verified">Implemented & Verified</span></td>
                    <td>Generates a random 6-character alphanumeric room code and persists room record.</td>
                </tr>
                <tr>
                    <td><strong>FR-03</strong></td>
                    <td>Room Joining & Capacity Enforcement</td>
                    <td><code>RoomPage.tsx</code>, <code>WebRTCService.ts</code></td>
                    <td><span class="badge badge-verified">Implemented & Verified</span></td>
                    <td>Validates room code; rejects entry if the room has reached 4 participants.</td>
                </tr>
                <tr>
                    <td><strong>FR-04</strong></td>
                    <td>Browser Camera & Mic Access</td>
                    <td><code>useMediaDevices.ts</code></td>
                    <td><span class="badge badge-verified">Implemented & Verified</span></td>
                    <td>Requests standard browser permissions; cleanly handles device denial or disconnections.</td>
                </tr>
                <tr>
                    <td><strong>FR-05</strong></td>
                    <td>Multi-Participant WebRTC Video Mesh</td>
                    <td><code>WebRTCService.ts</code>, <code>RoomPage.tsx</code></td>
                    <td><span class="badge badge-verified">Implemented & Verified</span></td>
                    <td>Establishes P2P audio and video streams between up to 4 participants simultaneously.</td>
                </tr>
                <tr>
                    <td><strong>FR-06</strong></td>
                    <td>Media Controls (Mute / Video Toggle)</td>
                    <td><code>CallControls.tsx</code>, <code>RoomPage.tsx</code></td>
                    <td><span class="badge badge-verified">Implemented & Verified</span></td>
                    <td>Participants can toggle audio and video tracks without severing the peer connection.</td>
                </tr>
                <tr>
                    <td><strong>FR-07</strong></td>
                    <td>Real-Time Sign Gesture Recognition</td>
                    <td><code>handSignDetector.ts</code>, <code>fastapi_server.py</code></td>
                    <td><span class="badge badge-verified">Implemented & Verified</span></td>
                    <td>Analyzes hand crops every 120ms; identifies static A–Z signs with confidence score.</td>
                </tr>
                <tr>
                    <td><strong>FR-08</strong></td>
                    <td>Temporal Smoothing & Debouncing</td>
                    <td><code>RoomPage.tsx</code> (lines 350–440)</td>
                    <td><span class="badge badge-verified">Implemented & Verified</span></td>
                    <td>Requires 2 stable frames (~360ms) to commit a letter; requires 1.5s deliberate hold for repeated letters.</td>
                </tr>
                <tr>
                    <td><strong>FR-09</strong></td>
                    <td>Dictionary Prefix Word Suggestions</td>
                    <td><code>dictionaryService.ts</code>, <code>useSignAI.ts</code></td>
                    <td><span class="badge badge-verified">Implemented & Verified</span></td>
                    <td>Suggests top 8 matching words within 2ms as characters are signed.</td>
                </tr>
                <tr>
                    <td><strong>FR-10</strong></td>
                    <td>Text-to-Speech (TTS) Voice Output</td>
                    <td><code>useSignAI.ts</code>, Web Speech API</td>
                    <td><span class="badge badge-verified">Implemented & Verified</span></td>
                    <td>Vocalizes recognized text for hearing callers using native browser speech synthesis.</td>
                </tr>
                <tr>
                    <td><strong>FR-11</strong></td>
                    <td>Offline Practice Detection Mode</td>
                    <td><code>UserOfflineDetectionPage.tsx</code></td>
                    <td><span class="badge badge-verified">Implemented & Verified</span></td>
                    <td>Enables single-user sign practice and speech-to-text validation without joining a call.</td>
                </tr>
                <tr>
                    <td><strong>FR-12</strong></td>
                    <td>Gemini Generative Sentence Auto-Complete</td>
                    <td><code>geminiSuggestionsService.ts</code></td>
                    <td><span class="badge badge-partial">Partially Implemented (Phase 5)</span></td>
                    <td>Contextual sentence completion interface defined; waiting for cloud proxy deployment.</td>
                </tr>
            </tbody>
        </table>

        <h2>5.2 Non-Functional Requirements (NFR)</h2>
        <table>
            <thead>
                <tr>
                    <th>NFR ID</th>
                    <th>Category</th>
                    <th>Metric / Target Specification</th>
                    <th>Architectural Implementation</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>NFR-01</strong></td>
                    <td>Latency</td>
                    <td>Sub-50ms model inference latency; &lt;250ms glass-to-glass video latency.</td>
                    <td>MobileNetV3Small lightweight architecture; direct UDP peer-to-peer WebRTC transport.</td>
                </tr>
                <tr>
                    <td><strong>NFR-02</strong></td>
                    <td>Throughput</td>
                    <td>Target 15–30 frames per second video; 5–8 inferences per second.</td>
                    <td>Asynchronous non-blocking fetch loop in React; offscreen canvas rendering.</td>
                </tr>
                <tr>
                    <td><strong>NFR-03</strong></td>
                    <td>Reliability</td>
                    <td>Zero crash rate if backend microservice goes offline.</td>
                    <td>Automatic client-side MediaPipe landmark fallback with anatomical validation rules.</td>
                </tr>
                <tr>
                    <td><strong>NFR-04</strong></td>
                    <td>Security</td>
                    <td>Encrypted media in transit; protected credentials.</td>
                    <td>DTLS-SRTP WebRTC encryption; Firebase Auth JWT tokens; zero API secrets in client.</td>
                </tr>
                <tr>
                    <td><strong>NFR-05</strong></td>
                    <td>Accessibility</td>
                    <td>WCAG 2.1 AA compliance; full keyboard navigation.</td>
                    <td>High-contrast dark theme, ARIA live region screen reader announcements (<code>a11y.ts</code>).</td>
                </tr>
                <tr>
                    <td><strong>NFR-06</strong></td>
                    <td>Portability</td>
                    <td>Responsive execution on desktop and mobile web browsers.</td>
                    <td>100% web standards (HTML5, WebRTC, ES6+); deployed to global Vercel Edge CDN.</td>
                </tr>
            </tbody>
        </table>

        <h2>5.3 User Roles & Persona Matrix</h2>
        <ul>
            <li><strong>Deaf / Hard-of-Hearing (DHH) Signer:</strong> Uses the webcam to communicate via ISL fingerspelling; benefits from visual subtitles, landmark skeleton overlays, dictionary word chips, and auto-voice synthesis.</li>
            <li><strong>Hearing Participant:</strong> Communicates primarily via speech audio and text chat; receives spoken audio synthesis of partner signs and reads real-time subtitle captions.</li>
            <li><strong>Room Host:</strong> Creates the meeting room, generates the room code, shares the invite link, and controls meeting parameters.</li>
            <li><strong>Self-Directed Learner:</strong> Accesses the offline practice mode (<code>/practice</code>) to rehearse fingerspelling signs with real-time accuracy feedback.</li>
        </ul>

        <h2>5.4 Visual Workflow Modeling</h2>

        <h3>Figure 5.1: Use-Case Diagram</h3>
        <div class="diagram-container">
            <svg viewBox="0 0 750 320" width="100%" height="auto" style="max-height: 280px;" xmlns="http://www.w3.org/2000/svg">
                <rect width="750" height="320" fill="#f8fafc" rx="6"/>
                <!-- System Boundary -->
                <rect x="180" y="20" width="390" height="280" fill="#ffffff" stroke="#2563eb" stroke-width="2" rx="8" />
                <text x="375" y="42" font-family="Inter, sans-serif" font-size="12" font-weight="bold" fill="#1e3a8a" text-anchor="middle">SignMate System Boundary</text>

                <!-- Actor 1: Signer -->
                <circle cx="90" cy="90" r="20" fill="#eff6ff" stroke="#2563eb" stroke-width="2" />
                <text x="90" y="125" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">DHH Signer</text>

                <!-- Actor 2: Hearing User -->
                <circle cx="90" cy="220" r="20" fill="#eff6ff" stroke="#2563eb" stroke-width="2" />
                <text x="90" y="255" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">Hearing User</text>

                <!-- Actor 3: Firebase / ML Backend -->
                <rect x="610" y="110" width="110" height="90" fill="#fef3c7" stroke="#d97706" stroke-width="1.5" rx="6" />
                <text x="665" y="135" font-family="Inter, sans-serif" font-size="10" font-weight="bold" fill="#92400e" text-anchor="middle">Cloud & ML</text>
                <text x="665" y="155" font-family="Inter, sans-serif" font-size="8.5" fill="#78350f" text-anchor="middle">Backend</text>

                <!-- Use Cases -->
                <ellipse cx="280" cy="75" rx="75" ry="18" fill="#f0fdf4" stroke="#16a34a" />
                <text x="280" y="79" font-family="Inter, sans-serif" font-size="8.5" font-weight="600" fill="#14532d" text-anchor="middle">Create / Join Room</text>

                <ellipse cx="470" cy="75" rx="75" ry="18" fill="#f0fdf4" stroke="#16a34a" />
                <text x="470" y="79" font-family="Inter, sans-serif" font-size="8.5" font-weight="600" fill="#14532d" text-anchor="middle">Signaling (RTDB)</text>

                <ellipse cx="375" cy="130" rx="85" ry="20" fill="#eff6ff" stroke="#2563eb" />
                <text x="375" y="134" font-family="Inter, sans-serif" font-size="8.5" font-weight="600" fill="#1e40af" text-anchor="middle">P2P Video Call (4 Max)</text>

                <ellipse cx="280" cy="190" rx="80" ry="20" fill="#fdf2f8" stroke="#db2777" />
                <text x="280" y="194" font-family="Inter, sans-serif" font-size="8.5" font-weight="600" fill="#831843" text-anchor="middle">Recognize Hand Signs</text>

                <ellipse cx="470" cy="190" rx="75" ry="18" fill="#fdf2f8" stroke="#db2777" />
                <text x="470" y="194" font-family="Inter, sans-serif" font-size="8.5" font-weight="600" fill="#831843" text-anchor="middle">Model Inference</text>

                <ellipse cx="375" cy="250" rx="85" ry="20" fill="#f5f3ff" stroke="#7c3aed" />
                <text x="375" y="254" font-family="Inter, sans-serif" font-size="8.5" font-weight="600" fill="#4c1d95" text-anchor="middle">Voice Synthesis & Captions</text>

                <!-- Association Lines -->
                <line x1="110" y1="90" x2="205" y2="75" stroke="#475569" stroke-width="1.2" />
                <line x1="110" y1="90" x2="290" y2="130" stroke="#475569" stroke-width="1.2" />
                <line x1="110" y1="90" x2="200" y2="190" stroke="#475569" stroke-width="1.2" />

                <line x1="110" y1="220" x2="205" y2="75" stroke="#475569" stroke-width="1.2" />
                <line x1="110" y1="220" x2="290" y2="130" stroke="#475569" stroke-width="1.2" />
                <line x1="110" y1="220" x2="290" y2="250" stroke="#475569" stroke-width="1.2" />

                <line x1="545" y1="75" x2="610" y2="130" stroke="#d97706" stroke-width="1.2" />
                <line x1="545" y1="190" x2="610" y2="150" stroke="#d97706" stroke-width="1.2" />
            </svg>
            <div class="diagram-caption">Figure 5.1: SignMate Unified Use-Case Model</div>
        </div>

        <h3>Figure 5.2: Sequence Diagram — Sign Recognition & Live Subtitle Broadcast</h3>
        <div class="diagram-container">
            <svg viewBox="0 0 780 340" width="100%" height="auto" style="max-height: 290px;" xmlns="http://www.w3.org/2000/svg">
                <rect width="780" height="340" fill="#f8fafc" rx="6"/>
                <!-- Lifelines -->
                <text x="70" y="30" font-family="Inter, sans-serif" font-size="9" font-weight="bold" fill="#1e3a8a" text-anchor="middle">DHH Signer</text>
                <line x1="70" y1="45" x2="70" y2="310" stroke="#94a3b8" stroke-dasharray="3,3" />

                <text x="210" y="30" font-family="Inter, sans-serif" font-size="9" font-weight="bold" fill="#1e3a8a" text-anchor="middle">Webcam (Browser)</text>
                <line x1="210" y1="45" x2="210" y2="310" stroke="#94a3b8" stroke-dasharray="3,3" />

                <text x="360" y="30" font-family="Inter, sans-serif" font-size="9" font-weight="bold" fill="#1e3a8a" text-anchor="middle">MediaPipe & Canvas</text>
                <line x1="360" y1="45" x2="360" y2="310" stroke="#94a3b8" stroke-dasharray="3,3" />

                <text x="510" y="30" font-family="Inter, sans-serif" font-size="9" font-weight="bold" fill="#047857" text-anchor="middle">FastAPI Model Server</text>
                <line x1="510" y1="45" x2="510" y2="310" stroke="#94a3b8" stroke-dasharray="3,3" />

                <text x="670" y="30" font-family="Inter, sans-serif" font-size="9" font-weight="bold" fill="#6d28d9" text-anchor="middle">Remote Hearing Caller</text>
                <line x1="670" y1="45" x2="670" y2="310" stroke="#94a3b8" stroke-dasharray="3,3" />

                <!-- Messages -->
                <line x1="70" y1="65" x2="210" y2="65" stroke="#2563eb" stroke-width="1.5" marker-end="url(#arrow)" />
                <text x="140" y="58" font-family="Inter, sans-serif" font-size="8" fill="#1e40af" text-anchor="middle">1. Signs letter 'H' to camera</text>

                <line x1="210" y1="95" x2="360" y2="95" stroke="#2563eb" stroke-width="1.5" />
                <text x="285" y="88" font-family="Inter, sans-serif" font-size="8" fill="#1e40af" text-anchor="middle">2. Frame grabbed (120ms loop)</text>

                <line x1="360" y1="125" x2="360" y2="145" stroke="#2563eb" stroke-width="1.5" />
                <line x1="360" y1="145" x2="390" y2="145" stroke="#2563eb" stroke-width="1.5" />
                <line x1="390" y1="145" x2="360" y2="145" stroke="#2563eb" stroke-width="1.5" />
                <text x="420" y="140" font-family="Inter, sans-serif" font-size="7.5" fill="#475569">3. Crop 160x160 Grayscale</text>

                <line x1="360" y1="175" x2="510" y2="175" stroke="#059669" stroke-width="1.5" />
                <text x="435" y="168" font-family="Inter, sans-serif" font-size="8" fill="#047857" text-anchor="middle">4. POST /api/v1/predict/base64</text>

                <line x1="510" y1="205" x2="360" y2="205" stroke="#059669" stroke-width="1.5" stroke-dasharray="3,3" />
                <text x="435" y="198" font-family="Inter, sans-serif" font-size="8" fill="#047857" text-anchor="middle">5. Return: 'H' (conf: 0.98, class: 8)</text>

                <line x1="360" y1="235" x2="70" y2="235" stroke="#2563eb" stroke-width="1.5" />
                <text x="215" y="228" font-family="Inter, sans-serif" font-size="8" fill="#1e40af" text-anchor="middle">6. Commit after 2 frames stable</text>

                <line x1="70" y1="265" x2="670" y2="265" stroke="#7c3aed" stroke-width="2" />
                <text x="370" y="258" font-family="Inter, sans-serif" font-size="8.5" font-weight="bold" fill="#5b21b6" text-anchor="middle">7. WebRTC DataChannel: sendLiveCaption('H', 'HELLO')</text>

                <line x1="670" y1="290" x2="670" y2="305" stroke="#7c3aed" stroke-width="1.5" />
                <text x="670" y="320" font-family="Inter, sans-serif" font-size="8" fill="#4c1d95" text-anchor="middle">8. Display Subtitles & Trigger TTS Voice</text>
            </svg>
            <div class="diagram-caption">Figure 5.2: Sign Recognition & Subtitle Streaming Sequence Diagram</div>
        </div>
    </section>
    """
