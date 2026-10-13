"""
Chapter 1: Project Overview & Core Mission
"""

def get_chapter_1():
    return """
    <section id="chapter-1" class="page-break">
        <h1>Chapter 1: Project Overview & Core Mission</h1>

        <h2>1.1 Project Identity & Executive Summary</h2>
        <p>
            <strong>SignMate: AI-Assisted Inclusive Communication</strong> is an accessible, web-based real-time video conferencing application designed to facilitate seamless communication between Deaf or Hard-of-Hearing (DHH) signers and hearing individuals. The platform integrates browser-native peer-to-peer WebRTC video calling with an artificial intelligence inference pipeline that detects Indian Sign Language (ISL) static hand gestures, translates them into text, and verbalizes them via speech synthesis.
        </p>

        <div class="note-box">
            <div class="note-box-title">Academic & Institutional Project Identity</div>
            <ul style="margin-left: 15px; margin-bottom: 0;">
                <li><strong>Project Title:</strong> SignMate — AI-Assisted Inclusive Communication</li>
                <li><strong>Candidate Name:</strong> Muhammed Rashid KP</li>
                <li><strong>Student Register Number / Project ID:</strong> TVE25MCA-2046</li>
                <li><strong>Degree & Program:</strong> Master of Computer Applications (MCA Final-Year Project)</li>
                <li><strong>Institution:</strong> College of Engineering Trivandrum (TVE)</li>
                <li><strong>Live Deployed URL:</strong> <a href="https://signmate-ashy.vercel.app/" target="_blank">https://signmate-ashy.vercel.app/</a></li>
            </ul>
        </div>

        <h2>1.2 The Communication Problem</h2>
        <p>
            Globally, over 430 million people require rehabilitation for disabling hearing loss, with tens of millions communicating primarily through regional sign languages such as Indian Sign Language (ISL). Despite sign language being a complete, natural language, over 99% of the general hearing population cannot read or comprehend sign gestures.
        </p>
        <p>
            This fundamental linguistic barrier produces severe everyday challenges:
        </p>
        <ul>
            <li><strong>Asymmetry in Everyday Interaction:</strong> Hearing individuals rely heavily on vocal speech and acoustic feedback. When a DHH individual attends a remote medical consultation, academic lecture, or administrative interview, communication stalls without an expensive certified human interpreter.</li>
            <li><strong>Digital Isolation in Video Conferencing:</strong> Mainstream video calling software (Zoom, Microsoft Teams, Google Meet) is engineered around audio capture and voice-activity detection. When a DHH user signs in a video call, the video platform does not detect voice activity, frequently downgrades video resolution, hides the user from the active speaker layout, and provides zero translation.</li>
            <li><strong>Typing Fatigue & Disrupted Eye Contact:</strong> DHH individuals often resort to text chat boxes during video meetings. However, constantly looking down to type in a text box breaks interpersonal visual communication, causes cognitive overload, and slows conversational cadence down to an unnatural speed.</li>
        </ul>

        <h2>1.3 Motivation & Problem Statement</h2>
        <p>
            <strong>Problem Statement:</strong> Existing teleconferencing platforms require Deaf and Hard-of-Hearing users to either secure third-party human interpreters or trade off visual sign communication for cumbersome text chatting. Furthermore, dedicated hardware-based sign interpretation setups (e.g., sensor gloves or depth cameras) are unaffordable, bulky, and inaccessible to everyday users.
        </p>
        <p>
            <strong>Motivation:</strong> With modern web standards, any standard consumer smartphone, tablet, or laptop equipped with a commodity RGB webcam can capture video frames and process deep learning models directly in real time. SignMate was conceived to eliminate the interpreter requirement by providing an embedded, zero-cost, browser-accessible inclusive video calling environment.
        </p>

        <h2>1.4 Proposed Solution</h2>
        <p>
            SignMate delivers a zero-installation, responsive web application that simultaneously hosts up to four participants in an encrypted WebRTC full-mesh video call while executing an intelligent computer vision pipeline. The system crops incoming webcam frames around hand regions, passes them through a deep convolutional neural network (MobileNetV3Small), maps output probabilities across 27 distinct classes, filters out neutral non-gesture frames, temporally stabilizes committed letters, provides intelligent dictionary word suggestions, and synthesizes speech for hearing participants.
        </p>

        <h2>1.5 Main Objectives</h2>
        <ol>
            <li><strong>Zero-Installation Web Accessibility:</strong> Eliminate heavy native application installations by delivering a progressive, responsive web platform running entirely in modern web browsers via Vercel.</li>
            <li><strong>Four-Participant WebRTC Video Calling:</strong> Establish encrypted, low-latency, multi-peer audio and video transmission among up to four participants without reliance on commercial proprietary SDKs like ZEGOCLOUD.</li>
            <li><strong>High-Accuracy Static Sign Recognition:</strong> Implement transfer-learning based image classification using MobileNetV3Small trained on a 27-class dataset, attaining 97.00% independent test accuracy.</li>
            <li><strong>Dual-Mode Real-Time Inference:</strong> Support client-side anatomical fallback using Google MediaPipe Hands alongside a dedicated Python FastAPI inference microservice.</li>
            <li><strong>Assistive Communication Features:</strong> Integrate client-side vocabulary recommendations (95,000+ words), screen reading accessibility (ARIA), visual live subtitle streaming, and voice synthesis (Web Speech API).</li>
        </ol>

        <h2>1.6 Scope & Intended Users</h2>
        <p>
            <strong>Intended Users:</strong> Deaf and Hard-of-Hearing individuals, their hearing family members, remote educators, telemedicine doctors, customer service agents, and peer students collaborating in small study groups.
        </p>
        <p>
            <strong>Scope:</strong> The current project scope covers real-time video conferencing for up to 4 participants per room and the classification of <em>isolated static alphabet hand signs (ISL fingerspelling A–Z)</em> plus a dedicated background/neutral hand state.
        </p>

        <h2>1.7 Critical Clarification: Isolated Alphabet Recognition vs. Continuous Sign Language</h2>
        <div class="alert-box">
            <div class="alert-box-title">CRITICAL EXAM CLARIFICATION (DO NOT EXAGGERATE)</div>
            <p style="margin-bottom: 4px;">
                <strong>Examiners will immediately penalize claiming that SignMate translates "continuous Indian Sign Language sentences".</strong>
            </p>
            <p style="margin-bottom: 0;">
                Indian Sign Language (ISL) is a rich, natural language characterized by dynamic two-handed movements, non-manual facial markers, spatial grammar, and head postures. The implemented SignMate model classifies <strong>isolated static manual alphabet signs (fingerspelling)</strong> from static image frames. It converts fingerspelled gestures into characters (e.g., 'H', 'E', 'L', 'L', 'O'), and assists sentence assembly using client-side word prediction. It does <em>not</em> yet interpret full dynamic sentence grammar or facial expressions.
            </p>
        </div>

        <h2>1.8 What Makes SignMate Novel?</h2>
        <p>
            Unlike generic video calling software (Google Meet, Zoom, WhatsApp):
        </p>
        <table>
            <thead>
                <tr>
                    <th>Feature Dimension</th>
                    <th>Standard Video Platforms (Zoom / Meet)</th>
                    <th>SignMate Platform</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>In-Band Sign Recognition</strong></td>
                    <td>None. Requires external third-party software or human interpreter.</td>
                    <td><span class="badge badge-verified">Implemented</span> Embedded computer vision pipeline processes webcam frames live.</td>
                </tr>
                <tr>
                    <td><strong>Speech Output for Signs</strong></td>
                    <td>None. DHH users must manually type into the text box.</td>
                    <td><span class="badge badge-verified">Implemented</span> Recognized text is automatically synthesized to speech for hearing callers.</td>
                </tr>
                <tr>
                    <td><strong>Dynamic Subtitle Broadcasting</strong></td>
                    <td>Only transcribes spoken English voice. Ignores signed gestures.</td>
                    <td><span class="badge badge-verified">Implemented</span> Signs are broadcasted live over the WebRTC data layer as visual captions.</td>
                </tr>
                <tr>
                    <td><strong>Dictionary Prefix Expansion</strong></td>
                    <td>Standard text auto-correct only in typing chat.</td>
                    <td><span class="badge badge-verified">Implemented</span> Single-click expansion of fingerspelled letters into full conversational words.</td>
                </tr>
                <tr>
                    <td><strong>Infrastructure Cost</strong></td>
                    <td>Expensive enterprise licenses for breakout interpretation rooms.</td>
                    <td><span class="badge badge-verified">Implemented</span> 100% open-source, serverless frontend, peer-to-peer mesh.</td>
                </tr>
            </tbody>
        </table>

        <h2>1.9 Three Pitch Formats for Presentation Day</h2>

        <div class="viva-card viva-normal">
            <div class="viva-q">1. The 30-Second Examiner Pitch</div>
            <div class="viva-a">
                "Respected examiners, <strong>SignMate</strong> is an inclusive web-based video conferencing platform built for Deaf and Hard-of-Hearing individuals. It allows up to four participants to communicate over WebRTC while an integrated lightweight deep learning model, MobileNetV3Small, detects Indian Sign Language alphabet gestures directly from webcam frames with 97% test accuracy. The system translates manual signs into live subtitles, offers conversational word suggestions, and synthesizes speech in real time, bridging the barrier between signers and hearing callers without requiring human interpreters."
            </div>
        </div>

        <div class="viva-card viva-normal">
            <div class="viva-q">2. The 1-Minute Comprehensive Pitch</div>
            <div class="viva-a">
                "Millions of Deaf and Hard-of-Hearing individuals face severe isolation in modern remote communication because conventional tools like Zoom or Google Meet are designed solely around spoken audio. SignMate solves this by embedding computer vision directly into a peer-to-peer WebRTC video room.<br><br>
                Built using React 19, TypeScript, and Tailwind CSS on the frontend, SignMate captures live camera frames and processes them through MobileNetV3Small, a convolutional neural network trained on 17,113 grayscale images across 27 classes—including a crucial neutral background class. The platform incorporates temporal smoothing and debouncing to prevent accidental character repetitions, provides instant dictionary word suggestions from a 95,000-word dataset, and speaks the words out loud using the Web Speech API. It is already deployed live on Vercel and accessible across any modern web browser without installing external plugins."
            </div>
        </div>

        <div class="viva-card viva-normal">
            <div class="viva-q">3. The 2-Minute Technical Introduction</div>
            <div class="viva-a">
                "From an architectural perspective, SignMate is engineered as a decoupled, multi-tier system. The presentation tier is a responsive single-page web application developed with React 19, Vite, and TypeScript. Video communication is powered by a WebRTC full-mesh topology accommodating up to four active participants, coordinated through a resilient three-tier signaling architecture utilizing Firebase Realtime Database with BroadcastChannel fallback for multi-tab testing.<br><br>
                For machine learning inference, the application utilizes a hybrid execution model. At its core is <code>SignMate_MobileNetV3Small</code>, a transfer-learning model trained on ImageNet weights with a custom classification head (Dense 128 + Dropout + Softmax 27). The model receives 160×160 single-channel grayscale inputs, expands them via internal concatenation, and outputs class confidence scores. In local development or client environments, this model is served via a high-performance Python FastAPI microservice at sub-50ms latencies or deployed as an optimized 3.88 MB TensorFlow Lite model. Client-side, Google MediaPipe Hands provides hand region-of-interest cropping and anatomical landmark verification. The system is secured using Firebase Authentication, HTTPS transit encryption, and strict input validation."
            </div>
        </div>

        <div class="viva-card viva-normal">
            <div class="viva-q">4. "Explain Your Project In Your Own Words" (Natural, Confident Viva Answer)</div>
            <div class="viva-a">
                <em>"I built SignMate because if a Deaf person and a hearing person want to have a video call today, they either need to hire an interpreter or constantly look down and type in a chat box. SignMate brings the interpreter inside the call. When a user shows a sign to the camera, the website recognizes the letter, suggests full words like 'HELLO' or 'THANK YOU', displays it as live captions for both people, and even speaks the words out loud for the hearing person. I deployed it as a website so anyone can open a link on their phone or laptop and start talking immediately."</em>
            </div>
        </div>
    </section>
    """
