"""
Chapter 21: Rapid Revision Sheet & Pre-Viva Cheat Sheet
"""

def get_chapter_21():
    return """
    <section id="chapter-21" class="page-break">
        <h1>Chapter 21: Rapid Revision Sheet & Pre-Viva Cheat Sheet</h1>

        <h2>21.1 Master Project Quick-Reference Table</h2>
        <table>
            <thead>
                <tr>
                    <th style="width: 25%;">Topic / Metric</th>
                    <th style="width: 75%;">Verified Project Value (Memorize These Exact Facts)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Project Name & Tagline</strong></td>
                    <td><strong>SignMate</strong> — AI-Assisted Inclusive Communication</td>
                </tr>
                <tr>
                    <td><strong>Candidate & Register No.</strong></td>
                    <td><strong>Muhammed Rashid KP</strong> (Register No: <strong>TVE25MCA-2046</strong>)</td>
                </tr>
                <tr>
                    <td><strong>Institution & Program</strong></td>
                    <td>College of Engineering Trivandrum (TVE) — Master of Computer Applications (MCA)</td>
                </tr>
                <tr>
                    <td><strong>Frontend Architecture</strong></td>
                    <td>React 19 + TypeScript + Vite 8 + Tailwind CSS 3 (Hosted on Vercel CDN)</td>
                </tr>
                <tr>
                    <td><strong>Live Deployment URL</strong></td>
                    <td><code>https://signmate-ashy.vercel.app/</code></td>
                </tr>
                <tr>
                    <td><strong>Video Communication</strong></td>
                    <td>Browser-native <strong>WebRTC Full Mesh</strong> (Maximum <strong>4 participants</strong>, 6 P2P connections)</td>
                </tr>
                <tr>
                    <td><strong>Signaling Mechanism</strong></td>
                    <td>3-Tier Hybrid: Firebase Realtime Database (Primary) + FastAPI (LAN) + BroadcastChannel (Local Tabs)</td>
                </tr>
                <tr>
                    <td><strong>AI Model Architecture</strong></td>
                    <td><strong>MobileNetV3Small</strong> Transfer Learning (Pretrained ImageNet Base + Dense 128 Head + Softmax 27)</td>
                </tr>
                <tr>
                    <td><strong>Model Checkpoint & Format</strong></td>
                    <td><code>SignMate_stage1_best.keras</code> (5.27 MB) &amp; <code>SignMate_MobileNetV3Small.tflite</code> (3.88 MB)</td>
                </tr>
                <tr>
                    <td><strong>Input Tensor Shape</strong></td>
                    <td><strong>[1, 160, 160, 1]</strong> (Batch: 1, Height: 160, Width: 160, Grayscale Channels: 1, float32, Range: 0–255)</td>
                </tr>
                <tr>
                    <td><strong>Output Tensor Shape</strong></td>
                    <td><strong>[1, 27]</strong> (Softmax probability distribution across 27 classes)</td>
                </tr>
                <tr>
                    <td><strong>Class Index 0</strong></td>
                    <td><strong>Background / Neutral / No-Hand</strong> (Maps to empty string <code>""</code> to prevent false letters)</td>
                </tr>
                <tr>
                    <td><strong>Class Indices 1 to 26</strong></td>
                    <td>Letters <strong>A through Z</strong> (Standard ISL static manual fingerspelling)</td>
                </tr>
                <tr>
                    <td><strong>Total Dataset Size</strong></td>
                    <td><strong>17,113 grayscale images</strong> (12,845 train [~75%] + 4,268 test [~25%])</td>
                </tr>
                <tr>
                    <td><strong>Model Parameters</strong></td>
                    <td><strong>1,171,139 total parameters</strong> (77,339 trainable in Stage 1; 939,120 frozen ImageNet base)</td>
                </tr>
                <tr>
                    <td><strong>Validation Best Metric</strong></td>
                    <td><strong>100.00% validation accuracy</strong> at Epoch 4 (val_loss: 0.0078; early stopping at Epoch 7)</td>
                </tr>
                <tr>
                    <td><strong>Independent Test Metrics</strong></td>
                    <td><strong>Accuracy: 97.00%</strong> | <strong>Loss: 0.1045</strong> | <strong>Macro F1: 0.9704</strong> | <strong>Macro Recall: 0.9703</strong></td>
                </tr>
                <tr>
                    <td><strong>Language Assistance</strong></td>
                    <td>Client-side <strong>95,000-word dictionary engine</strong> (<code>dictionaryService.ts</code>) with &lt;2ms prefix search</td>
                </tr>
                <tr>
                    <td><strong>Speech Synthesis</strong></td>
                    <td>Browser-native <strong>Web Speech API</strong> (<code>window.speechSynthesis</code>)</td>
                </tr>
            </tbody>
        </table>

        <h2>21.2 Ten Difficult Questions with Punchy Answers</h2>
        <div class="note-box" style="font-size: 8.5pt;">
            <ol style="margin-left: 15px; margin-bottom: 0;">
                <li><strong>Why MobileNetV3Small?</strong> "Because it has only 1.17M parameters, runs inference in ~34ms on standard CPUs, and fits within 3.88 MB for edge deployment."</li>
                <li><strong>Why is Class 0 essential?</strong> "Without Class 0 (background), the model is forced to predict a letter whenever the camera views an empty room or resting hands."</li>
                <li><strong>Why not divide pixel inputs by 255?</strong> "MobileNetV3Small was trained with <code>include_preprocessing=True</code>, which rescales internally. Dividing by 255 outside causes catastrophic double-normalization."</li>
                <li><strong>Why 4 participants max?</strong> "Full mesh requires $N(N-1)/2$ connections. For 4 users, each maintains 3 connections (6 total in room), reaching the bandwidth limit for client uploads without an SFU."</li>
                <li><strong>How did you solve signaling glare?</strong> "By comparing client IDs lexicographically (<code>clientId_A &lt; clientId_B</code>) so only one peer initiates the offer."</li>
                <li><strong>What does Vercel host?</strong> "Vercel hosts the static React bundle and assets. It does not run Python. The Python AI server runs locally or on a VPS."</li>
                <li><strong>Does Gemini recognize signs?</strong> "No. Gemini is a text LLM. MobileNetV3Small performs sign classification. Gemini is an architected Phase 5 text completion interface."</li>
                <li><strong>Why did you abandon GRUs?</strong> "MediaPipe landmark coordinates suffered from cascading failures when finger joints were occluded. CNNs process raw image textures directly."</li>
                <li><strong>Why 100% val accuracy vs 97% test accuracy?</strong> "Validation data shared identical camera environments with training batches; the independent test set featured completely separate physical signers."</li>
                <li><strong>Is this full ISL translation?</strong> "No. This is static alphabet fingerspelling recognition with dictionary word assistance. Full continuous ISL requires temporal dynamic modeling."</li>
            </ol>
        </div>

        <h2>21.3 "Read This Before Entering the Viva" (1-Page Emergency Cheat Sheet)</h2>
        <div class="alert-box" style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px;">
            <div style="font-weight: 800; color: #92400e; font-size: 11pt; margin-bottom: 8px;">
                ⚡ THE 6 GOLDEN RULES TO DEFEND SIGNMATE
            </div>
            <ol style="margin-left: 18px; margin-bottom: 0; color: #78350f; font-size: 9pt; line-height: 1.6;">
                <li><strong>Never say "continuous sign language translation":</strong> Always say <em>"isolated static alphabet recognition (fingerspelling) with word prediction assistance"</em>.</li>
                <li><strong>Know your model by heart:</strong> <em>MobileNetV3Small</em>, transfer learning on ImageNet, input <em>[1, 160, 160, 1]</em> grayscale float32 (range 0–255), 27 classes, <em>1.17M total parameters</em>.</li>
                <li><strong>Know your test metrics:</strong> <em>97.00% test accuracy</em>, <em>0.1045 test loss</em>, <em>0.9704 macro F1</em> on 4,268 test images.</li>
                <li><strong>Know your WebRTC numbers:</strong> <em>Up to 4 participants</em> in a <em>full mesh</em>, giving <em>6 connections</em> in the room ($N(N-1)/2$). STUN via Google; signaling via Firebase RTDB.</li>
                <li><strong>Be honest about Gemini:</strong> Gemini is <em>designed as a Phase 5 proxy interface</em>; production currently uses our fast client-side <em>95,000-word dictionary service</em>.</li>
                <li><strong>Be confident about stack changes:</strong> Migrating from Flutter and ZEGOCLOUD to React and WebRTC was a deliberate engineering improvement to achieve <em>zero-installation web accessibility</em> and <em>eliminate paid vendor lock-in</em>.</li>
            </ol>
        </div>

        <h2>21.4 Three Memorizable Presentation Scripts</h2>

        <div class="viva-card viva-normal">
            <div class="viva-q">1. The 30-Second Script (If the examiner says: "Be brief, tell me what you built")</div>
            <div class="viva-a">
                "Good morning, respected examiners. I built <strong>SignMate</strong>, a web-based inclusive video call platform for Deaf and Hard-of-Hearing users. It allows up to four people to video call over WebRTC while an integrated deep learning model, <strong>MobileNetV3Small</strong>, recognizes Indian Sign Language fingerspelled alphabet signs in real time with <strong>97% test accuracy</strong>. The system translates manual signs into live subtitles, offers dictionary word suggestions, and vocalizes speech for hearing callers, bridging the communication barrier without requiring expensive human interpreters."
            </div>
        </div>

        <div class="viva-card viva-normal">
            <div class="viva-q">2. The 1-Minute Script (Standard Presentation Opening)</div>
            <div class="viva-a">
                "Respected examiners, over 430 million people worldwide live with disabling hearing loss, yet mainstream video tools like Zoom or Google Meet are designed solely around spoken voice, forcing Deaf users to type in text boxes.<br><br>
                To solve this, I developed <strong>SignMate</strong>, a zero-installation web application deployed live on Vercel. SignMate establishes an encrypted, four-participant peer-to-peer WebRTC video mesh coordinated via Firebase Realtime Database. As a user signs to their webcam, our <strong>MobileNetV3Small</strong> computer vision model evaluates 160×160 grayscale hand crops, classifying 27 classes with <strong>97% independent test accuracy</strong>.<br><br>
                To ensure a smooth user experience, the system applies temporal smoothing and debouncing, recommends full words from a 95,000-word vocabulary, and speaks the words out loud using speech synthesis. It provides an autonomous, inclusive communication platform accessible from any modern web browser."
            </div>
        </div>

        <div class="viva-card viva-normal">
            <div class="viva-q">3. The 2-Minute Technical Script (If the examiner asks for technical depth)</div>
            <div class="viva-a">
                "From an engineering perspective, SignMate is divided into three decoupled tiers: the presentation tier, the peer-to-peer media plane, and the machine learning inference pipeline.<br><br>
                The frontend is built with React 19, Vite, and TypeScript. For video conferencing, we engineered a <strong>Full Mesh WebRTC topology</strong> supporting up to four participants ($N=4$, yielding 6 bidirectional connections) using Google STUN servers. We solved signaling glare deterministically by comparing client IDs in Firebase Realtime Database.<br><br>
                Our machine learning architecture uses <strong>MobileNetV3Small</strong> adapted via transfer learning from ImageNet. We trained the model on 17,113 grayscale images across 27 classes, including a vital background/neutral class to eliminate false positives. The model contains 1.17 million parameters, with 77,339 trained in the classification head (Dense 128 + Dropout + Softmax 27). On an independent test set of 4,268 unseen images, the model achieved <strong>97.00% accuracy</strong> and a <strong>Macro F1-score of 0.9704</strong>.<br><br>
                For deployment, we converted the checkpoint into a <strong>3.88 MB TensorFlow Lite</strong> flatbuffer model served via an asynchronous Python FastAPI microservice at sub-50ms latency, with client-side MediaPipe landmark fallback. We also built an in-memory 95,000-word dictionary service that predicts conversational words in under 2ms. The entire frontend is live on Vercel at <code>signmate-ashy.vercel.app</code>."
            </div>
        </div>
    </section>
    """
