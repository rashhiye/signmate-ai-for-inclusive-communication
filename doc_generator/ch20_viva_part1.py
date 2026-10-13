"""
Chapter 20: Complete Viva Question Bank - Part 1 (Categories A through J, Questions 1 to 52)
"""

def get_viva_card(num, cat, question, answer, deep=None, example=None, warn=None):
    card_type = "viva-trap" if warn else "viva-normal"
    html = f"""
    <div class="viva-card {card_type}">
        <div class="viva-q"><span class="viva-num">Q{num}</span> [{cat}] {question}</div>
        <div class="viva-a"><strong>Answer:</strong> {answer}</div>
    """
    if deep:
        html += f"""<div class="viva-deep"><strong>Deeper Technical Explanation:</strong> {deep}</div>"""
    if example:
        html += f"""<div class="viva-example"><strong>SignMate Project Example:</strong> {example}</div>"""
    if warn:
        html += f"""<div class="viva-warn"><strong>⚠️ Examiner Trap / Status Alert:</strong> {warn}</div>"""
    html += "</div>"
    return html

def get_chapter_20_part1():
    q_list = []
    
    # Category A: Project Introduction & Problem Statement
    q_list.append(get_viva_card(
        1, "Cat A", "What is SignMate in simple words?",
        "SignMate is an accessible web application that lets Deaf and hearing people have a video call where sign language hand gestures are automatically translated into text subtitles and spoken out loud.",
        "It integrates real-time WebRTC video conferencing with a convolutional neural network (MobileNetV3Small) trained to recognize Indian Sign Language fingerspelling.",
        "When a user signs the letter 'A' into the camera, 'A' appears on the screen, full words like 'ALL' are suggested, and the text is vocalized for hearing participants.",
        None
    ))
    q_list.append(get_viva_card(
        2, "Cat A", "What exact problem does SignMate solve?",
        "It solves the severe communication gap between Deaf signers and hearing people during video calls, eliminating the need for expensive human interpreters or slow text typing.",
        "Mainstream video platforms (Zoom, Google Meet) rely on voice activity detection to highlight speakers and lack any native computer vision sign interpretation tools.",
        "In a standard video call, a Deaf person must look down to type in a chat box. In SignMate, they simply sign naturally to the webcam.",
        None
    ))
    q_list.append(get_viva_card(
        3, "Cat A", "What is the main contribution of your project?",
        "Our main contribution is embedding deep learning sign classification and client-side dictionary word acceleration directly into an open-source, serverless WebRTC video conferencing web application.",
        "We proved that high-accuracy (97%) sign recognition can run in real-time over the web without requiring proprietary commercial SDKs or specialized sensory hardware.",
        "We achieved sub-50ms inference latency and 4-participant full mesh video calling using standard web technologies.",
        None
    ))
    q_list.append(get_viva_card(
        4, "Cat A", "Is SignMate translating complete sign language sentences or only individual letters?",
        "SignMate currently classifies isolated static alphabet signs (ISL fingerspelling A–Z) plus a neutral background state, assisted by word-prediction dictionaries.",
        "Continuous Indian Sign Language translation requires complex multi-frame temporal modeling of dynamic two-handed movements and facial expressions, which is planned for future work.",
        "A user fingerspells 'H-E-L' and selects 'HELLO' from the dictionary suggestion chips.",
        "NEVER claim SignMate translates full continuous ISL grammar. Always specify it is isolated alphabet recognition with dictionary assistance."
    ))
    q_list.append(get_viva_card(
        5, "Cat A", "Who are the target beneficiaries of this system?",
        "Deaf and Hard-of-Hearing individuals, their hearing family members, teachers in inclusive classrooms, telemedicine doctors, and customer support representatives.",
        "It enables direct independent communication without waiting hours or paying fees for professional certified sign language interpreters.",
        "A Deaf student participating in a group study project with three hearing classmates.",
        None
    ))

    # Category B: Software Engineering & Requirements
    q_list.append(get_viva_card(
        6, "Cat B", "What software development life cycle (SDLC) model did you follow?",
        "We followed the Agile iterative prototyping model.",
        "Agile allowed us to iterate through multiple prototypes, discover critical real-world constraints (like the unreliability of landmark-only GRUs), and refactor the architecture quickly.",
        "Migrating from Flutter to React and from ZEGOCLOUD to WebRTC was accomplished across discrete sprint iterations.",
        None
    ))
    q_list.append(get_viva_card(
        7, "Cat B", "What are the primary functional requirements of SignMate?",
        "User authentication, 6-character room creation, 4-participant WebRTC video calling, camera/mic controls, 120ms sign detection, temporal smoothing, dictionary suggestions, and speech synthesis.",
        "Each requirement is formally tracked in Chapter 5 with verified source code implementations.",
        "FR-08 enforces that a hand sign must be held stable for 2 frames before committing to prevent jitter.",
        None
    ))
    q_list.append(get_viva_card(
        8, "Cat B", "What are the key non-functional requirements?",
        "Low latency (<50ms inference, <250ms video delay), high reliability (client-side fallback if backend drops), strong security (DTLS-SRTP encryption), and WCAG 2.1 AA accessibility.",
        "Non-functional requirements dictate architectural choices, such as using UDP over TCP and converting heavy Keras models to TFLite.",
        "If the Python FastAPI server goes down, the web client seamlessly falls back to MediaPipe landmarks so the user never sees a crash.",
        None
    ))
    q_list.append(get_viva_card(
        9, "Cat B", "How do you ensure accessibility for DHH users?",
        "Through visual subtitle streaming, live landmark skeleton overlays, high-contrast dark mode, and screen-reader announcements using ARIA live regions.",
        "WCAG 2.1 AA guidelines were implemented across semantic HTML elements and keyboard navigation handlers in src/utils/a11y.ts.",
        "When an AI letter is detected, announceToScreenReader('Letter H recognized') notifies blind or low-vision callers.",
        None
    ))

    # Category C: System Architecture
    q_list.append(get_viva_card(
        10, "Cat C", "Can you explain the high-level architecture of SignMate?",
        "SignMate uses a multi-tier architecture: a React 19 single-page frontend on Vercel, a Firebase Realtime Database signaling bus, a peer-to-peer WebRTC media mesh, and a Python FastAPI deep learning backend.",
        "The control plane (signaling) is separated from the media plane (P2P video). Deep learning inference is decoupled via REST endpoints with a client-side fallback.",
        "Figure 3.1 in Chapter 3 shows how media streams bypass the web server and flow directly between peer browsers.",
        None
    ))
    q_list.append(get_viva_card(
        11, "Cat C", "Which components communicate directly and which go through a backend?",
        "Video and audio stream directly browser-to-browser via WebRTC. Signaling metadata passes through Firebase RTDB. AI frames are sent to FastAPI via HTTP POST.",
        "Direct P2P communication minimizes server bandwidth costs and guarantees the lowest possible latency for high-definition video.",
        "When User A signs to User B, video bytes travel directly across the Internet over UDP without touching Vercel or Firebase.",
        None
    ))
    q_list.append(get_viva_card(
        12, "Cat C", "What is the difference between the control plane and media plane in WebRTC?",
        "The control plane handles call setup and signaling (who is calling, SDP codecs, IP candidates). The media plane transports the actual encrypted video and audio packets.",
        "The control plane uses TCP/WebSockets over Firebase. The media plane uses UDP with DTLS-SRTP encryption directly between browsers.",
        "If Firebase disconnects after the call starts, the video stream often continues playing because the media plane is already connected.",
        None
    ))
    q_list.append(get_viva_card(
        13, "Cat C", "Why did you choose a client-server hybrid model for AI inference?",
        "To achieve maximum flexibility: heavy, high-accuracy deep learning runs on the Python FastAPI server when available, while the browser runs MediaPipe landmark rules locally if offline.",
        "This dual-mode architecture guarantees zero downtime for users while preserving 97% model accuracy when connected to the backend.",
        "In src/ai/handSignDetector.ts, checkFastApiHealth() tests the server and dynamically routes frames.",
        None
    ))

    # Category D: Frontend & Web Development
    q_list.append(get_viva_card(
        14, "Cat D", "Why did you choose React 19 for the frontend?",
        "React 19 provides modern functional components, hooks, high rendering performance via the Virtual DOM, and excellent TypeScript support.",
        "React's declarative component architecture makes managing complex real-time states (video tracks, peer arrays, recognized letters) predictable.",
        "RoomPage.tsx decomposes cleanly into VideoGrid, ParticipantTile, CallControls, and HandLandmarkOverlay.",
        None
    ))
    q_list.append(get_viva_card(
        15, "Cat D", "What role does Vite play in this project?",
        "Vite is the build tool and local development server. It uses native ES modules for instant server start and Rollup for optimized production bundling.",
        "Unlike older Webpack configurations that took 30+ seconds to bundle, Vite provides near-instant Hot Module Replacement (HMR).",
        "Running 'npm run build' outputs tree-shaken, minified JavaScript files in the dist/ folder for Vercel deployment.",
        None
    ))
    q_list.append(get_viva_card(
        16, "Cat D", "How is state managed across the website?",
        "We used custom React Context hooks: useAuth for user sessions, useMediaDevices for camera/mic, useSignAI for AI buffers, and useToast for alerts.",
        "Lightweight Context hooks eliminate the need for bulky external libraries like Redux while keeping state modular and easy to debug.",
        "When useSignAI commits a letter, RoomPage and RecognitionPanel re-render instantly without passing props down 10 levels.",
        None
    ))
    q_list.append(get_viva_card(
        17, "Cat D", "What is the difference between videoFit 'cover' and 'contain' in RoomPage?",
        "'Cover' scales the video to fill the tile completely (may crop edges). 'Contain' letterboxes the video so 100% of the camera frame is visible.",
        "Contain mode is critical for signers because cover mode might crop their hands or arms out of view on narrow mobile screens.",
        "Users can toggle between cover and contain modes via the call settings menu in RoomPage.tsx.",
        None
    ))

    # Category E & F: WebRTC, Networking & Signaling
    q_list.append(get_viva_card(
        18, "Cat E", "What does WebRTC stand for and what is its main advantage?",
        "Web Real-Time Communication. Its main advantage is browser-native peer-to-peer audio and video streaming with sub-200ms latency without plugins.",
        "It provides standard C++ networking implementations built directly into Chromium and WebKit browsers.",
        "SignMate uses RTCPeerConnection to stream 720p webcam video between callers.",
        None
    ))
    q_list.append(get_viva_card(
        19, "Cat E", "What is an SDP Offer and SDP Answer?",
        "SDP (Session Description Protocol) is a text format describing media capabilities. The Offer lists codecs and encryption parameters from Caller A; the Answer is Caller B's response.",
        "SDP exchange negotiates video codecs (e.g., VP8/H.264), audio codecs (Opus), resolution, and SRTP cryptographic fingerprints.",
        "In WebRTCService.ts, peer.pc.createOffer() produces the SDP string sent to Firebase RTDB.",
        None
    ))
    q_list.append(get_viva_card(
        20, "Cat E", "What are ICE candidates?",
        "ICE (Interactive Connectivity Establishment) candidates are network endpoints (IP address, port, protocol) where a browser can potentially be reached.",
        "The browser discovers Host candidates (local LAN IP), Server Reflexive candidates (public IP from STUN), and Relay candidates (from TURN).",
        "peer.pc.onicecandidate captures candidates and stores them in Firebase RTDB so the remote peer can test connectivity.",
        None
    ))
    q_list.append(get_viva_card(
        21, "Cat F", "What is the purpose of a STUN server?",
        "STUN (Session Traversal Utilities for NAT) tells a browser its own public IP address and port as seen from the public Internet when behind a NAT router.",
        "Home Wi-Fi routers use NAT, giving laptops private IPs (like 192.168.1.5). STUN allows the laptop to find out its public Internet IP.",
        "SignMate uses Google's public STUN server pool: stun:stun.l.google.com:19302.",
        None
    ))
    q_list.append(get_viva_card(
        22, "Cat F", "When is a TURN server necessary?",
        "A TURN (Traversal Using Relays around NAT) server is needed when both peers are behind strict 'Symmetric NATs' or corporate firewalls that block direct P2P UDP packets.",
        "TURN relays all audio/video packets through a cloud server. It is expensive to run because it consumes gigabytes of server bandwidth.",
        "In SignMate, public STUN is implemented and verified; TURN is planned for restrictive enterprise network deployments.",
        None
    ))
    q_list.append(get_viva_card(
        23, "Cat F", "Why is signaling needed if WebRTC is peer-to-peer?",
        "Because two browsers on opposite sides of the world do not know each other's IP addresses, security keys, or codecs before the call starts.",
        "WebRTC deliberately omits signaling from the specification, allowing developers to choose any signaling protocol (WebSockets, Firebase, SIP).",
        "SignMate uses Firebase Realtime Database as its cloud signaling server to pass the initial SDP offer and answer.",
        None
    ))
    q_list.append(get_viva_card(
        24, "Cat F", "How did you solve 'glare' in WebRTC signaling?",
        "Glare happens when two peers send each other an SDP offer at the exact same moment. We resolved this deterministically by comparing client IDs.",
        "The client with the lexicographically smaller ID (clientId_A < clientId_B) acts as the initiator and creates the offer; the other client answers.",
        "In WebRTCService.ts: const isInitiator = this.clientId < remoteId; completely eliminates glare.",
        None
    ))
    q_list.append(get_viva_card(
        25, "Cat F", "How many peer connections are required for a 4-person mesh call?",
        "Exactly 6 bidirectional peer connections across the room, with each individual participant maintaining 3 peer connections.",
        "The mathematical formula for a full mesh is N * (N - 1) / 2. For N = 4: (4 * 3) / 2 = 6 total connections.",
        "Each participant uploads 3 video streams and downloads 3 video streams simultaneously.",
        None
    ))

    # Category G & H: Machine Learning, CNN & MobileNetV3Small
    q_list.append(get_viva_card(
        26, "Cat G", "What is Machine Learning in simple terms?",
        "Machine Learning is a method where a computer program learns patterns from data examples rather than relying on human programmers to write explicit rules.",
        "The model adjusts numerical weights through mathematical optimization (gradient descent) to minimize prediction error.",
        "We showed the model 12,845 photos of hand signs so it learned what letter 'A' looks like.",
        None
    ))
    q_list.append(get_viva_card(
        27, "Cat G", "What is an Artificial Neural Network (ANN)?",
        "A computational model inspired by biological brains, consisting of interconnected layers of artificial neurons that process and transform input numbers.",
        "Each neuron multiplies inputs by weights, adds a bias, and passes the result through an activation function (like ReLU or Softmax).",
        "SignMate uses a Deep Convolutional Neural Network with over 1.17 million parameters.",
        None
    ))
    q_list.append(get_viva_card(
        28, "Cat H", "What is a Convolutional Neural Network (CNN)?",
        "A specialized neural network designed for processing visual images using small sliding filters to preserve 2D spatial relationships.",
        "Unlike standard dense networks that flatten images into 1D arrays, CNNs detect localized features like edges, curves, and textures regardless of position.",
        "In SignMate, convolutional layers detect finger joints, thumb curves, and palm contours from the 160x160 image.",
        None
    ))
    q_list.append(get_viva_card(
        29, "Cat H", "Why did you choose MobileNetV3Small over ResNet or VGG?",
        "MobileNetV3Small was specifically designed by Google for real-time mobile and edge vision. It has only ~1.17M parameters compared to ResNet-50's 25M+ and VGG-16's 138M.",
        "It uses depthwise separable convolutions and squeeze-and-excitation optimization to achieve high accuracy with minimal CPU and memory usage.",
        "MobileNetV3Small executes inference in ~34ms on standard CPUs, allowing real-time video processing.",
        None
    ))
    q_list.append(get_viva_card(
        30, "Cat H", "What is Transfer Learning?",
        "Transfer learning is taking a model that was already trained on a massive general dataset (ImageNet) and fine-tuning it for our specific task (sign language).",
        "Instead of training 1.17M weights from scratch (which requires months and millions of images), the model reuses pre-learned edge and shape features.",
        "We used ImageNet pretrained weights for MobileNetV3Small and trained only the top classification head.",
        None
    ))
    q_list.append(get_viva_card(
        31, "Cat H", "Why did you freeze the base model during initial training?",
        "Freezing the base model prevents ImageNet's valuable pre-trained feature weights from being corrupted or destroyed by large random gradients during early epochs.",
        "Only the 77,339 weights in our custom classification head were updated, allowing stable, fast convergence in just 7 epochs.",
        "Non-trainable params: 939,120; Trainable params: 77,339.",
        None
    ))
    q_list.append(get_viva_card(
        32, "Cat H", "What is the function of GlobalAveragePooling2D?",
        "It compresses spatial feature maps (5x5x576) into a 1D vector (576 elements) by calculating the mathematical average of each feature map.",
        "It drastically reduces parameter count compared to Flatten layers, prevents overfitting, and makes the model invariant to slight spatial translations.",
        "Output shape changes from (None, 5, 5, 576) to (None, 576).",
        None
    ))
    q_list.append(get_viva_card(
        33, "Cat H", "What does the Dropout layer do?",
        "Dropout randomly turns off a percentage (20%) of neurons during training to prevent the network from becoming overly reliant on any single feature.",
        "It forces the network to learn redundant, robust feature combinations, acting as an effective regularization technique against overfitting.",
        "Our model uses Dropout(0.2) before Dense(128) and before the output layer.",
        None
    ))
    q_list.append(get_viva_card(
        34, "Cat H", "What does the Softmax activation function do?",
        "Softmax converts the model's raw numerical outputs (logits) into a probability distribution where each value is between 0 and 1, and all 27 values sum to 1.0.",
        "The formula is: exp(z_i) / sum(exp(z_j)). The index with the highest probability represents the model's final predicted class.",
        "For letter 'A', the model outputs a vector where index 1 has value 0.98, and other classes have near-zero values.",
        None
    ))

    # Category I & J: Dataset & Model Training
    q_list.append(get_viva_card(
        35, "Cat I", "Describe your training and testing dataset.",
        "The dataset contains 17,113 total images across 27 classes: 12,845 images in the training set and 4,268 images in the independent testing set.",
        "Images are single-channel grayscale JPEGs with raw dimensions around 310x310, resized to 160x160 pixels.",
        "Class 0 is background/no-hand; Classes 1 to 26 represent letters A to Z.",
        None
    ))
    q_list.append(get_viva_card(
        36, "Cat I", "Why is the background/no-hand class (Class 0) so important?",
        "Without a background class, a 26-class model is mathematically forced to predict a letter even when the camera sees an empty room or a resting hand.",
        "Class 0 provides a negative control, allowing the model to assign high probability to 'neutral' when no valid sign gesture is made.",
        "In signmate_labels.json, '0' maps to '' (empty string), so background frames are silently ignored.",
        None
    ))
    q_list.append(get_viva_card(
        37, "Cat I", "Why did you use grayscale instead of RGB color images?",
        "Grayscale reduces memory usage by 66.7% (1 channel instead of 3) and prevents the model from developing bias based on human skin color tones.",
        "Hand sign recognition depends on geometric contours and finger positions, which are fully captured in luminance grayscale.",
        "Input tensor shape is [1, 160, 160, 1].",
        None
    ))
    q_list.append(get_viva_card(
        38, "Cat I", "How does the model handle grayscale input if MobileNet expects 3 channels?",
        "We included a Concatenate layer (concatenate_1) inside the model graph that duplicates the single grayscale channel three times before feeding MobileNet.",
        "This allows the pre-trained ImageNet weights (which expect 3-channel input) to operate without modifying the internal convolutional filter shapes.",
        "In model summary: Input (None, 160, 160, 1) -> Concatenate (None, 160, 160, 3) -> MobileNetV3Small.",
        None
    ))
    q_list.append(get_viva_card(
        39, "Cat I", "What data augmentations were applied during training?",
        "RandomRotation(0.05), RandomTranslation(0.05, 0.05), RandomZoom(0.08), and RandomContrast(0.08).",
        "Augmentations artificially simulate variations in user camera distance, slight hand tilts, and lighting differences, preventing overfitting.",
        "These operations run directly inside the Keras Sequential augmentation layer during training.",
        None
    ))
    q_list.append(get_viva_card(
        40, "Cat I", "What was the double-normalization bug and how was it fixed?",
        "The model was built with include_preprocessing=True, which already rescales pixel values internally. Dividing by 255 in external code caused double normalization.",
        "Dividing by 255 twice reduced pixel values to near zero (0.0 to 0.0039), destroying feature signals and causing erratic predictions.",
        "The fix was ensuring fastapi_server.py feeds raw unscaled float32 values in the range 0 to 255.",
        None
    ))
    q_list.append(get_viva_card(
        41, "Cat J", "What optimizer and loss function were used?",
        "Adam optimizer (Adaptive Moment Estimation) and Categorical Cross-Entropy loss.",
        "Adam computes adaptive learning rates for each parameter using moving averages of past gradients and squared gradients.",
        "Categorical cross-entropy penalizes the model based on the negative log probability assigned to the true class.",
        None
    ))
    q_list.append(get_viva_card(
        42, "Cat J", "What is an epoch and how many epochs did training run?",
        "An epoch is one complete training pass through all 12,845 training images. Training stopped at Epoch 7 due to early stopping.",
        "The best checkpoint was saved at Epoch 4 where validation loss reached 0.0078 and validation accuracy reached 100%.",
        "The model was saved as SignMate_stage1_best.keras.",
        None
    ))
    q_list.append(get_viva_card(
        43, "Cat J", "What is Early Stopping and why did you use it?",
        "Early Stopping is a callback that monitors validation loss and stops training if it fails to improve for a set number of epochs (patience).",
        "It prevents overfitting by halting training before the model starts memorizing noise in the training set.",
        "Training halted at Epoch 7 because validation loss had stabilized at Epoch 4.",
        None
    ))
    q_list.append(get_viva_card(
        44, "Cat J", "What is the difference between an epoch, a batch, and an iteration?",
        "An epoch is one pass through the entire dataset. A batch is the subset of images evaluated together (e.g., 32). An iteration is one weight update per batch.",
        "If a dataset has 12,845 images and batch size is 32, one epoch contains approximately 402 iterations (weight updates).",
        "Total training iterations across 7 epochs: ~2,800 gradient updates.",
        None
    ))
    q_list.append(get_viva_card(
        45, "Cat J", "What is a learning rate?",
        "The learning rate is a hyperparameter that controls how large of an adjustment is made to the model's weights during gradient descent.",
        "Too high a learning rate causes training to oscillate or diverge; too low a learning rate makes training excessively slow or gets stuck in local minima.",
        "A learning rate of 0.001 was used with the Adam optimizer.",
        None
    ))
    q_list.append(get_viva_card(
        46, "Cat J", "What is Overfitting and how did you prevent it?",
        "Overfitting is when a model performs exceptionally well on training data but poorly on unseen test data because it memorized specific training examples.",
        "We prevented overfitting using: 1) Data augmentation, 2) Dropout layers (0.2), 3) Global Average Pooling, 4) Early Stopping callbacks, and 5) Transfer learning.",
        "Proof of no catastrophic overfitting: The model achieved 97.00% accuracy on 4,268 completely unseen test images.",
        None
    ))
    q_list.append(get_viva_card(
        47, "Cat J", "What is Underfitting?",
        "Underfitting occurs when a model is too simple to learn the underlying patterns in the data, resulting in poor performance on both training and test data.",
        "It is caused by insufficient model capacity, overly aggressive regularization, or premature training termination.",
        "Our high training and validation accuracy confirmed the model had ample capacity to learn the 27 classes.",
        None
    ))
    q_list.append(get_viva_card(
        48, "Cat J", "What is the difference between parameters and hyperparameters?",
        "Parameters are internal weights learned automatically by the model from data (e.g., the 1.17M weights). Hyperparameters are settings chosen by the engineer before training.",
        "Hyperparameters include learning rate, batch size, number of epochs, dropout rate, and image input size.",
        "Hyperparameter: input size 160x160; Learned parameter: Dense weight matrices.",
        None
    ))
    q_list.append(get_viva_card(
        49, "Cat J", "Why did you use Categorical Cross-Entropy instead of Binary Cross-Entropy?",
        "Binary Cross-Entropy is used for 2-class problems. Categorical Cross-Entropy is mathematically required for multi-class classification where classes are mutually exclusive.",
        "It compares the predicted 27-element Softmax probability vector against the one-hot encoded ground truth label vector.",
        "Loss = -sum(y_true * log(y_pred)).",
        None
    ))
    q_list.append(get_viva_card(
        50, "Cat J", "What is One-Hot Encoding?",
        "A representation where a categorical label is converted into a vector of zeros with a single '1' at the index corresponding to the class.",
        "Class 0 is [1, 0, 0, ...], Class 1 ('A') is [0, 1, 0, ...], Class 2 ('B') is [0, 0, 1, ...].",
        "It ensures the model treats class labels as distinct categories rather than imposing an artificial numerical ordering.",
        None
    ))
    q_list.append(get_viva_card(
        51, "Cat J", "What was your final test accuracy and test loss?",
        "On the 4,268 unseen test images, the model achieved 97.00% test accuracy and a test loss of 0.1045.",
        "Macro Precision was 0.9739, Macro Recall was 0.9703, and Macro F1-score was 0.9704.",
        "These are verified historical evaluation metrics recorded from test set evaluation.",
        None
    ))
    q_list.append(get_viva_card(
        52, "Cat J", "Why is validation accuracy 100% at epoch 4 but test accuracy 97%?",
        "Validation batches during training shared similar capture conditions with the training data, while the test set featured distinct signers, lighting, and camera angles.",
        "A 3% difference between validation and completely independent test data is standard in real-world computer vision and demonstrates healthy generalization.",
        "The model correctly classified 4,140 out of 4,268 test images.",
        None
    ))

    return "".join(q_list)
