"""
Chapter 20: Complete Viva Question Bank - Part 2 (Categories K through T, Questions 53 to 110)
"""

from .ch20_viva_part1 import get_viva_card

def get_chapter_20_part2():
    q_list = []

    # Category K: TensorFlow Lite & Inference
    q_list.append(get_viva_card(
        53, "Cat K", "What is TensorFlow Lite and why convert to it?",
        "TensorFlow Lite is an optimized runtime for edge and mobile inference. We convert to TFLite to reduce file size from 5.27 MB to 3.88 MB and enable low-latency execution.",
        "TFLite strips training graphs, backprop operators, and optimizer momentum states, packaging only inference kernels into an efficient FlatBuffer schema.",
        "SignMate_MobileNetV3Small.tflite is 4,070,012 bytes (~3.88 MB).",
        None
    ))
    q_list.append(get_viva_card(
        54, "Cat K", "What is the difference between training and inference?",
        "Training is the heavy phase where the model sees labeled data, calculates errors, and updates its weights. Inference is the fast production phase where the fixed model predicts on new unseen images.",
        "Training requires massive GPU memory and backward passes; inference requires only a forward pass without updating any weights.",
        "Training took ~7 epochs on a GPU; live inference takes ~34 milliseconds on a standard CPU.",
        None
    ))
    q_list.append(get_viva_card(
        55, "Cat K", "What is quantization in TensorFlow Lite?",
        "Quantization reduces the precision of model weights from 32-bit floating point (float32) down to 16-bit float (float16) or 8-bit integers (int8).",
        "It can shrink model size by up to 75% and accelerate CPU inference with negligible loss in accuracy.",
        "Our model currently runs in standard float32 mode with int8 quantization planned for mobile edge execution.",
        None
    ))
    q_list.append(get_viva_card(
        56, "Cat K", "How does the model handle confidence thresholds?",
        "If the highest predicted class probability is below 0.70 (70%), the prediction is discarded as uncertain or transitional noise.",
        "This ensures that slight hand movements between signs do not trigger random unwanted characters.",
        "In RoomPage.tsx: if (result.confidence >= 0.70) validates the threshold.",
        None
    ))
    q_list.append(get_viva_card(
        57, "Cat K", "What is temporal smoothing?",
        "Temporal smoothing requires a sign to remain consistent across multiple consecutive frames (here, 2 frames &asymp; 240–360ms) before committing.",
        "It acts as a low-pass filter on predictions, eliminating single-frame classification spikes or camera sensor flicker.",
        "If the model predicts 'A' for one frame and immediately drops it, 'A' is not appended to the text buffer.",
        None
    ))
    q_list.append(get_viva_card(
        58, "Cat K", "What is debouncing in the context of SignMate?",
        "Debouncing prevents repeatedly holding the same sign from adding duplicate letters on every single frame.",
        "Without debouncing, holding sign 'A' for 2 seconds would produce 16 'A's. Debouncing locks the committed letter until the hand is relaxed or held for a deliberate duration.",
        "In RoomPage.tsx, lastCommittedLetter locks the character until released.",
        None
    ))
    q_list.append(get_viva_card(
        59, "Cat K", "How does a user intentionally sign a double letter like 'LL' in 'HELLO'?",
        "Through the hold-count mechanism: if a user sustains the exact same gesture continuously for 13 frames (~1.5 seconds), the system recognizes the deliberate hold and appends the second letter.",
        "This balances typing speed with intentional spelling of double-letter words.",
        "In RoomPage.tsx: if (holdCount >= 13 && repeatCount === 0) appends the second 'L'.",
        None
    ))
    q_list.append(get_viva_card(
        60, "Cat K", "How does the system know when a user finished a sign?",
        "When the hand is lowered, opened into a flat resting palm, or leaves the camera frame for 2 consecutive frames, releaseCount triggers a reset.",
        "This resets the candidate letter and hold counters, making the system immediately receptive to the next sign.",
        "In RoomPage.tsx lines 370–384.",
        None
    ))

    # Category L: Accuracy, Precision, Recall, F1 & Confusion Matrix
    q_list.append(get_viva_card(
        61, "Cat L", "Why is accuracy alone not sufficient to evaluate a classifier?",
        "Accuracy can be misleading on imbalanced datasets. If 90% of data is background and 10% is signs, a dummy model predicting 'background' every time has 90% accuracy but is completely useless.",
        "Metrics like Precision, Recall, and F1-score reveal class-by-class performance and expose bias.",
        "We measured Macro Precision (0.9739), Macro Recall (0.9703), and Macro F1 (0.9704) across all 27 individual classes.",
        None
    ))
    q_list.append(get_viva_card(
        62, "Cat L", "What is Precision in the context of SignMate?",
        "Out of all times the model predicted letter 'A', what percentage was truly letter 'A'? High precision means low false alarms.",
        "Formula: TP / (TP + FP).",
        "SignMate achieved a Macro Precision of 97.39% on the test benchmark.",
        None
    ))
    q_list.append(get_viva_card(
        63, "Cat L", "What is Recall in the context of SignMate?",
        "Out of all actual images of letter 'A' in the test set, what percentage did the model correctly identify? High recall means few missed signs.",
        "Formula: TP / (TP + FN).",
        "SignMate achieved a Macro Recall of 97.03% on the test benchmark.",
        None
    ))
    q_list.append(get_viva_card(
        64, "Cat L", "What is the F1-Score?",
        "The F1-score is the harmonic mean of precision and recall: 2 * (Precision * Recall) / (Precision + Recall).",
        "It provides a balanced measure that penalizes extreme imbalances between precision and recall.",
        "SignMate's Macro F1-score is 0.9704.",
        None
    ))
    q_list.append(get_viva_card(
        65, "Cat L", "What is a Confusion Matrix?",
        "A 27x27 grid where rows represent ground-truth classes and columns represent predicted classes. Diagonal cells represent correct classifications.",
        "Off-diagonal cells reveal specific pairs of signs that the model confuses with one another.",
        "It showed that letters with similar hand shapes (like 'M' and 'N') occasionally overlap.",
        None
    ))
    q_list.append(get_viva_card(
        66, "Cat L", "Why might letters like 'M' and 'N' be confused by the model?",
        "In Indian Sign Language, 'M' and 'N' differ primarily by thumb placement under three fingers vs. two fingers, which can look identical from certain webcam angles.",
        "When viewed head-on without 3D depth, finger occlusion obscures thumb tucking.",
        "This is why dictionary prefix matching is invaluable: if 'M' or 'N' is slightly ambiguous, the word suggestion engine guides the user to the correct word.",
        None
    ))
    q_list.append(get_viva_card(
        67, "Cat L", "What is the difference between Macro F1 and Weighted F1?",
        "Macro F1 computes the unweighted average of F1-scores across all 27 classes, treating every class equally. Weighted F1 weights each score by the number of samples in that class.",
        "Macro F1 is harsher because poor performance on a rare class significantly drags down the score.",
        "SignMate's Macro F1 is 0.9704; Weighted F1 is 0.9702.",
        None
    ))
    q_list.append(get_viva_card(
        68, "Cat L", "Does 97% test accuracy mean 97% of live webcam signs are recognized?",
        "No. Benchmark test sets are photographed under controlled conditions, whereas live webcams suffer from room lighting shifts, motion blur, and background clutter.",
        "Real-time webcam accuracy is typically 80–90% depending on camera quality and lighting.",
        "We mitigate this with temporal smoothing and dictionary recommendations.",
        None
    ))

    # Category M: FastAPI & APIs
    q_list.append(get_viva_card(
        69, "Cat M", "What is FastAPI and why is it used?",
        "FastAPI is a modern, high-speed Python web framework used to serve our Keras/TensorFlow deep learning model via REST endpoints.",
        "It provides asynchronous execution (ASGI), automatic Pydantic request validation, and sub-millisecond routing overhead.",
        "It runs on port 8000 and serves POST /api/v1/predict/base64.",
        None
    ))
    q_list.append(get_viva_card(
        70, "Cat M", "What is a REST API?",
        "Representational State Transfer (REST) is an architectural style for web services using standard HTTP verbs (GET, POST, PUT, DELETE) and JSON data payloads.",
        "It decouples client and server: the React web app can run anywhere and communicate with the Python API over standard HTTP.",
        "React sends POST requests with Base64 image payloads and receives JSON prediction results.",
        None
    ))
    q_list.append(get_viva_card(
        71, "Cat M", "What is CORS and why did you configure it in FastAPI?",
        "Cross-Origin Resource Sharing (CORS) is a browser security mechanism that blocks web pages on one domain from making fetch requests to a different domain.",
        "Because our frontend is on Vercel (signmate-ashy.vercel.app) while the API runs on localhost or a custom server, CORS middleware is required to allow requests.",
        "app.add_middleware(CORSMiddleware, allow_origins=['*']) in fastapi_server.py.",
        None
    ))
    q_list.append(get_viva_card(
        72, "Cat M", "What does the /api/v1/health endpoint return?",
        "It returns server operational status, model loaded confirmation, target input shape, and total class count.",
        "Used by the frontend to detect whether the deep learning server is active or if it should use client-side MediaPipe rules.",
        "Returns {'status': 'online', 'model_loaded': true, 'input_shape': [1, 160, 160, 1], 'classes_count': 27}.",
        None
    ))
    q_list.append(get_viva_card(
        73, "Cat M", "What is Pydantic and how is it used in FastAPI?",
        "Pydantic is a Python data validation library that enforces type hints and validates incoming request schemas at runtime.",
        "It automatically parses JSON request bodies, validates fields, and generates detailed HTTP 422 errors for malformed requests.",
        "class PredictBase64Request(BaseModel): image_base64: str.",
        None
    ))
    q_list.append(get_viva_card(
        74, "Cat M", "How is latency measured in the inference endpoint?",
        "Using Python's time.time() before and after image preprocessing and model forward pass, converted to milliseconds.",
        "Latency = (time.time() - start_time) * 1000.0, returned in the JSON response as inference_time_ms.",
        "Typical execution latency is 30–45ms per frame on modern multi-core CPUs.",
        None
    ))
    q_list.append(get_viva_card(
        75, "Cat M", "What happens if an invalid or corrupt image is sent to the API?",
        "PIL Image.open() raises an exception, which is caught and returned as an HTTP 500/400 error without crashing the server.",
        "The frontend catches the error and silently drops the frame without interrupting the video call.",
        "In fastapi_server.py: try/except block around image processing.",
        None
    ))

    # Category N: Firebase & Authentication
    q_list.append(get_viva_card(
        76, "Cat N", "What services do you use from Firebase?",
        "Firebase Authentication (user login/signup), Firebase Realtime Database (WebRTC signaling), and Cloud Firestore (room records).",
        "It provides managed, scalable cloud backends without requiring us to deploy and maintain custom database or auth servers.",
        "Configured in src/firebase/config.ts.",
        None
    ))
    q_list.append(get_viva_card(
        77, "Cat N", "How does Firebase Authentication work in SignMate?",
        "Users register with email/password or Google OAuth. Firebase securely stores credentials, hashes passwords with bcrypt, and issues a JWT session token.",
        "The token is stored in the browser's IndexedDB, keeping the user logged in across page refreshes.",
        "In src/firebase/firebaseAuth.ts: signInWithEmailAndPassword() and signInWithPopup().",
        None
    ))
    q_list.append(get_viva_card(
        78, "Cat N", "What is the difference between Authentication and Authorization?",
        "Authentication verifies identity (Who are you? E.g., verifying password). Authorization verifies permissions (What are you allowed to access? E.g., can this user delete this room?).",
        "Authentication is handled by Firebase Auth; Authorization is enforced by Firestore Security Rules.",
        "In firestore.rules: allow delete: if request.auth.uid == resource.data.hostId ensures only the room host can delete the room.",
        None
    ))
    q_list.append(get_viva_card(
        79, "Cat N", "Why is Firebase Realtime Database used for WebRTC signaling?",
        "RTDB uses low-latency persistent WebSockets. When a client writes an SDP offer or ICE candidate, Google's cloud pushes it to other connected clients in under 30ms.",
        "It provides the real-time event bus needed for browser discovery before WebRTC connects.",
        "Path: rooms/{roomId}/mesh/{pairKey}/offer.",
        None
    ))
    q_list.append(get_viva_card(
        80, "Cat N", "What is onDisconnect() in Firebase RTDB?",
        "It is a server-side hook that automatically executes a database write (such as deleting a user's presence node) the instant their TCP socket disconnects.",
        "It prevents ghost participants from lingering in rooms if a user abruptly closes their browser tab or loses power.",
        "onDisconnect(myPeerRef).remove() in WebRTCService.ts.",
        None
    ))
    q_list.append(get_viva_card(
        81, "Cat N", "Are your Firebase API keys safe in the client source code?",
        "Yes. Firebase client API keys are public routing identifiers, not administrative secrets. Real security is enforced by Firestore Security Rules and Auth JWT tokens on Google's servers.",
        "Sensitive secrets like the Firebase Admin SDK private key are never exposed in the web client.",
        "Firebase documentation explicitly confirms that client config objects are designed to be public.",
        None
    ))

    # Category O: Gemini & Language Assistance
    q_list.append(get_viva_card(
        82, "Cat O", "What is the role of the dictionary service in SignMate?",
        "It provides high-speed prefix search across 95,000+ words to recommend full conversational words from partial fingerspelled letters.",
        "It reduces the physical effort required by Deaf signers by over 60%, allowing them to select words after signing only 2–3 letters.",
        "When 'HEL' is signed, it suggests 'HELLO' and 'HELP' in under 2 milliseconds.",
        None
    ))
    q_list.append(get_viva_card(
        83, "Cat O", "Why are priority conversational words ranked first?",
        "Common phrases like 'HELLO', 'PLEASE', 'THANK YOU', and 'DOCTOR' occur much more frequently in daily life than obscure dictionary terms like 'HELIUM' or 'HELIX'.",
        "Prioritizing conversational words places the most relevant communicative terms at the top of the recommendation chips.",
        "Defined in PRIORITY_WORDS in src/services/dictionaryService.ts.",
        None
    ))
    q_list.append(get_viva_card(
        84, "Cat O", "Does Google Gemini recognize hand signs in SignMate?",
        "No. Gemini is a Large Language Model and is never used for image classification. Sign recognition is performed entirely by MobileNetV3Small.",
        "Gemini's planned role is generative sentence auto-completion from recognized word sequences.",
        "Examiners frequently test whether candidates mistakenly believe an LLM is doing computer vision classification.",
        "Never say Gemini recognizes signs. MobileNetV3Small recognizes signs."
    ))
    q_list.append(get_viva_card(
        85, "Cat O", "What is the current implementation status of Gemini in SignMate?",
        "Gemini is architected as an abstract interface (IGeminiService in src/services/GeminiService.ts) and marked as a Phase 5 enhancement.",
        "In production, language assistance is actively powered by our fast client-side 95,000-word dictionary engine to protect API keys from exposure.",
        "geminiSuggestionsService.ts currently throws a placeholder notice for Phase 5.",
        "Do not claim Gemini is live in production. It is an architected Phase 5 enhancement."
    ))
    q_list.append(get_viva_card(
        86, "Cat O", "Why should recognized raw text remain visible even when suggestions exist?",
        "To preserve user control and communication transparency. The signer should always see the exact letters they formed so they can correct mistakes.",
        "Replacing raw input automatically without user confirmation can lead to frustrating auto-correct errors.",
        "The raw fingerspelling buffer is displayed alongside the clickable suggestion chips.",
        None
    ))
    q_list.append(get_viva_card(
        87, "Cat O", "How does Text-to-Speech (TTS) work in SignMate?",
        "Using the browser's native Web Speech API (window.speechSynthesis) to convert recognized text strings into spoken voice audio.",
        "It creates a SpeechSynthesisUtterance object and plays it through the device speakers at rate 1.0.",
        "speakRecognizedText() in useSignAI.ts.",
        None
    ))

    # Category P: Vercel & Deployment
    q_list.append(get_viva_card(
        88, "Cat P", "Where is the website hosted and how is it deployed?",
        "The frontend is deployed on Vercel's global edge network at https://signmate-ashy.vercel.app/. Deployment is automated via Git CI/CD.",
        "Every push to the main Git branch triggers Vite compilation, static asset generation, and global CDN caching.",
        "Verified live production URL: https://signmate-ashy.vercel.app/.",
        None
    ))
    q_list.append(get_viva_card(
        89, "Cat P", "What does Vercel host and what does it NOT host?",
        "Vercel hosts the static compiled web bundle (HTML, CSS, JS chunks, public JSON files). It does NOT host long-running Python TensorFlow processes.",
        "Vercel is a serverless static/Node CDN platform. Machine learning inference runs either client-side or on a separate Python server.",
        "The Python FastAPI backend (fastapi_server.py) runs on a dedicated host machine or container.",
        None
    ))
    q_list.append(get_viva_card(
        90, "Cat P", "What command builds the project for production?",
        "'npm run build', which executes 'vite build'.",
        "It transpiles TypeScript, bundles React components with Rollup, minifies code, and outputs static assets into the dist/ directory.",
        "The dist/ folder contains index.html and minified JS/CSS chunks.",
        None
    ))
    q_list.append(get_viva_card(
        91, "Cat P", "What is the difference between production and localhost?",
        "Localhost runs on your local machine for development (with Hot Module Replacement). Production runs on a globally distributed CDN with minified bundles, HTTPS, and caching.",
        "In production, WebRTC must navigate public NAT routers across the Internet using STUN servers.",
        "Localhost uses port 5173 (Vite) and port 8000 (FastAPI).",
        None
    ))
    q_list.append(get_viva_card(
        92, "Cat P", "Why is HTTPS strictly required for WebRTC?",
        "Modern web browsers enforce HTTPS for all sensitive hardware access APIs (getUserMedia for camera and microphone).",
        "On non-secure HTTP origins (except localhost), the browser automatically blocks camera and microphone access.",
        "Vercel automatically provisions SSL/TLS certificates via Let's Encrypt.",
        None
    ))
    q_list.append(get_viva_card(
        93, "Cat P", "How do you test the application across two different devices?",
        "Both devices open the production URL (https://signmate-ashy.vercel.app/), navigate to the same room code (e.g., X8LN7A), and grant camera access.",
        "Firebase RTDB handles signaling across the Internet, and WebRTC establishes direct P2P media streaming.",
        "Tested between a Windows laptop and an Android mobile phone.",
        None
    ))

    # Category Q: Security, Privacy & Ethics
    q_list.append(get_viva_card(
        94, "Cat Q", "How is video and audio data secured in transit?",
        "Through DTLS-SRTP (Datagram Transport Layer Security + Secure Real-time Transport Protocol), which provides mandatory end-to-end encryption for all WebRTC streams.",
        "Intermediate routers or Wi-Fi eavesdroppers cannot intercept or decode the audio and video packets.",
        "Mandated by the W3C WebRTC standard.",
        None
    ))
    q_list.append(get_viva_card(
        95, "Cat Q", "Does SignMate store user webcam images on a server?",
        "No. SignMate operates on a zero-retention privacy policy. Video frames are processed in-memory in RAM and immediately discarded.",
        "No camera frames, video clips, or biometric data are ever written to disk or saved to a database.",
        "Documented in Chapter 16 and SecurityPage.tsx.",
        None
    ))
    q_list.append(get_viva_card(
        96, "Cat Q", "What are the ethical considerations in sign language AI?",
        "1) Avoiding exaggerated accuracy claims; 2) Respecting the Deaf community by not claiming fingerspelling replaces rich natural sign language; 3) Ensuring algorithmic fairness across diverse skin tones.",
        "We used grayscale images to eliminate racial and skin-tone bias in the computer vision pipeline.",
        "We transparently disclose that the model classifies static alphabet signs, not complete sign language grammar.",
        None
    ))
    q_list.append(get_viva_card(
        97, "Cat Q", "How do you handle camera and microphone consent?",
        "The browser natively prompts the user for camera and microphone access before any stream is captured. Users can revoke permissions at any time.",
        "If a user denies permission, the app catches the error gracefully and displays a helpful banner instead of crashing.",
        "useMediaDevices.ts handles permission exceptions.",
        None
    ))
    q_list.append(get_viva_card(
        98, "Cat Q", "How are room codes secured against brute-force guessing?",
        "Room codes use 6 uppercase alphanumeric characters (36^6 = ~2.17 billion combinations). Rooms expire and are cleaned up upon disconnection.",
        "Firestore rules restrict operations to active rooms and valid participant limits.",
        "generateRoomCode(6) in src/utils/roomCode.ts.",
        None
    ))

    # Category R: Testing & Debugging
    q_list.append(get_viva_card(
        99, "Cat R", "How did you test the WebRTC mesh connection locally?",
        "Using BroadcastChannel and multi-tab testing, as well as multiple devices on the same local Wi-Fi network connecting through Firebase RTDB.",
        "BroadcastChannel allows instant tab-to-tab signaling with zero network latency, making it ideal for rapid UI and track debugging.",
        "Layer 1 signaling in WebRTCService.ts.",
        None
    ))
    q_list.append(get_viva_card(
        100, "Cat R", "How did you debug video playback issues during development?",
        "Using browser developer tools, chrome://webrtc-internals to inspect ICE states and packet loss, and adding catch blocks on HTMLVideoElement.play().",
        "Browsers block auto-playing video with audio unless muted or triggered by a user gesture. We added playsInline and error handlers.",
        "videoRef.current.play().catch(err => console.warn(err)).",
        None
    ))
    q_list.append(get_viva_card(
        101, "Cat R", "How did you verify that the TFLite model matches the Keras model?",
        "We ran both models on identical test sample images and compared output probabilities. The maximum probability difference was ~2.38 x 10^-7.",
        "This confirmed that the TensorFlow Lite conversion was numerically identical to the trained Keras checkpoint.",
        "Verified in Chapter 9 evaluation audit.",
        None
    ))
    q_list.append(get_viva_card(
        102, "Cat R", "What was the most challenging technical bug you encountered?",
        "The double-normalization bug where dividing pixel values by 255 in external preprocessing destroyed inference accuracy because MobileNet already had an internal rescaling layer.",
        "Debugging involved inspecting the raw tensor values entering the first convolution layer and realizing they were near zero.",
        "Fixed by passing unscaled float32 pixel values (0–255) to the model.",
        None
    ))

    # Category S: Limitations & Future Work
    q_list.append(get_viva_card(
        103, "Cat S", "What are the primary limitations of the current system?",
        "1) Classifies static alphabet signs only (no continuous dynamic grammar); 2) Maximum 4 participants due to full mesh bandwidth; 3) Optimized primarily for right-handed gestures; 4) Requires good room lighting.",
        "Each limitation is technically documented with its engineering cause in Chapter 19.",
        "Continuous translation requires temporal sequence models like Transformers.",
        None
    ))
    q_list.append(get_viva_card(
        104, "Cat S", "Why is participant capacity limited to 4 in a full mesh?",
        "In a full mesh, each client must upload N-1 video streams. For 4 participants, each user uploads 3 streams (~3.6 Mbps). Beyond 4 participants, client CPU and upstream bandwidth saturate quickly.",
        "Scaling to 10+ participants requires an SFU (Selective Forwarding Unit) media server.",
        "Formula: N * (N - 1) / 2 connections.",
        None
    ))
    q_list.append(get_viva_card(
        105, "Cat S", "How would you implement continuous sign language in the future?",
        "By replacing single-frame classification with a spatio-temporal model (such as a 3D CNN, ConvLSTM, or Video Vision Transformer) that analyzes 30-frame video clips over time.",
        "This would allow the model to recognize motion trajectory, two-handed interaction, and facial expressions.",
        "Outlined in Chapter 19 Future Roadmap.",
        None
    ))
    q_list.append(get_viva_card(
        106, "Cat S", "How would you scale SignMate to support 20 or 50 participants per room?",
        "By upgrading from a full-mesh topology to an SFU (Selective Forwarding Unit) such as MediaSoup or LiveKit.",
        "In an SFU architecture, each client uploads only 1 video stream to the cloud server, which forwards it to other participants, reducing client upload load from O(N) to O(1).",
        "Documented in Chapter 19.",
        None
    ))

    # Category T: Difficult Questions on Incomplete Implementations & Late Stack Changes
    q_list.append(get_viva_card(
        107, "Cat T", "Why did you switch away from the MediaPipe landmarks + GRU model?",
        "The GRU model suffered from cascading failures: whenever MediaPipe lost a single finger landmark due to lighting or occlusion, the entire sequence classification failed.",
        "MobileNetV3Small processes raw image pixels directly, making it significantly more resilient to finger overlap and lighting variations.",
        "Documented in Chapter 9.",
        None
    ))
    q_list.append(get_viva_card(
        108, "Cat T", "Why did you change from Flutter to a React web application?",
        "To eliminate installation friction. A Deaf user or hearing doctor should not have to download an APK and configure permissions to join a video call.",
        "A web application opens instantly in any browser via a URL link, offering superior accessibility.",
        "Documented in Chapters 2 and 18.",
        None
    ))
    q_list.append(get_viva_card(
        109, "Cat T", "Why didn't you use ZEGOCLOUD as originally planned?",
        "ZEGOCLOUD is a paid commercial proprietary SDK that charges per-minute fees and creates vendor lock-in.",
        "Building a native WebRTC mesh gave us complete ownership, zero recurring costs, and deep architectural understanding of real-time protocols.",
        "Documented in Chapter 7 and Chapter 18.",
        None
    ))
    q_list.append(get_viva_card(
        110, "Cat T", "Is the Google Gemini integration fully operational in your live deployment?",
        "No. Gemini is architected as an interface in src/services/GeminiService.ts for Phase 5 cloud proxy deployment. The live site currently uses our fast client-side 95,000-word dictionary service.",
        "This was an intentional architectural decision to avoid exposing Gemini API keys in the client browser.",
        "Verified in src/gemini/geminiSuggestionsService.ts.",
        "Never pretend Gemini is live in production. Always state it is an architected Phase 5 enhancement."
    ))

    return "".join(q_list)
