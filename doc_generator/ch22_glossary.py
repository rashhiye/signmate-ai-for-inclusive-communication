"""
Chapter 22: Comprehensive Technical Glossary (60+ Terms Defined in Simple English)
"""

def get_chapter_22():
    terms = [
        ("API (Application Programming Interface)", "A formalized digital contract enabling two different software applications to exchange data and request operations."),
        ("Backend", "The server-side component of a software application responsible for data processing, database management, and heavy computational logic."),
        ("Frontend", "The client-side user interface running directly inside a user's web browser, rendering visual components, graphics, and interactive buttons."),
        ("Framework", "A foundational software platform that dictates architectural application flow (Inversion of Control), within which developers write custom code."),
        ("Library", "A modular collection of pre-written functions, classes, and utilities that an application calls directly to solve specific sub-tasks."),
        ("WebRTC (Web Real-Time Communication)", "An open-source browser API suite that enables direct, encrypted, sub-200ms peer-to-peer audio, video, and data transmission without plugins."),
        ("Signaling", "The out-of-band communication process used by WebRTC peers to exchange network IP addresses, codecs, and cryptographic session descriptors before a call starts."),
        ("SDP (Session Description Protocol)", "A text-based configuration payload detailing a device's media capabilities: supported video/audio codecs, network transport ports, and security keys."),
        ("SDP Offer & Answer", "The two-stage negotiation handshake where Peer A offers its media capabilities, and Peer B answers with matching compatible parameters."),
        ("ICE (Interactive Connectivity Establishment)", "A networking framework that tests and selects the fastest connection route between two browsers across firewalls and NAT routers."),
        ("ICE Candidate", "A potential public or private IP address and port combination discovered by a browser that can be tested for peer communication."),
        ("STUN (Session Traversal Utilities for NAT)", "A lightweight public server that reflects back a browser's public-facing IP address and port as seen from the open Internet."),
        ("TURN (Traversal Using Relays around NAT)", "An intermediate cloud relay server that routes audio/video packets when symmetric firewalls block direct P2P connections."),
        ("Peer Connection (RTCPeerConnection)", "The core WebRTC software interface that maintains an active, encrypted peer-to-peer communication link between two browsers."),
        ("Full Mesh Topology", "A network architecture where every participant maintains a direct connection to every other participant, requiring N*(N-1)/2 total connections."),
        ("SFU (Selective Forwarding Unit)", "A central media server architecture where each client uploads 1 stream, and the server forwards packets to other callers without re-encoding."),
        ("CNN (Convolutional Neural Network)", "A deep learning neural network architecture designed specifically for 2D image analysis using sliding filter matrices to detect spatial features."),
        ("Convolution", "A mathematical operation where a small filter matrix (kernel) slides over pixel arrays, multiplying and summing values to detect visual patterns like edges."),
        ("Feature Extraction", "The automated process where neural network layers transform raw pixel grids into high-level geometric representations (finger joints, palm contours)."),
        ("Pooling (e.g., MaxPooling, AveragePooling)", "A dimensionality reduction operation that downsamples feature maps, shrinking spatial grid sizes while preserving dominant features."),
        ("GlobalAveragePooling2D", "A layer that computes the mathematical mean across an entire 2D feature map, converting spatial matrices into a compact 1D feature vector."),
        ("Dense Layer (Fully Connected)", "A layer where every artificial neuron connects to every neuron in the preceding layer, synthesizing high-level categorical decisions."),
        ("Dropout", "A regularization technique that randomly zeroes out a fraction of neuron outputs during training to force the network to learn robust, non-redundant features."),
        ("Softmax Function", "A mathematical activation function that converts unconstrained numerical scores into normalized probabilities summing to exactly 1.0 (100%)."),
        ("ReLU (Rectified Linear Unit)", "An activation function defined as f(x) = max(0, x), introducing non-linearity into neural networks while avoiding vanishing gradients."),
        ("MobileNetV3Small", "A state-of-the-art compact CNN developed by Google for mobile and edge vision, utilizing depthwise separable convolutions and squeeze-and-excitation blocks."),
        ("Transfer Learning", "The machine learning technique of taking a model pre-trained on a massive general dataset (ImageNet) and fine-tuning it for a specific target task."),
        ("Pretrained Weights (ImageNet)", "Internal numerical weight values learned by a neural network across 1.4 million natural images, serving as a rich feature initialization."),
        ("Epoch", "One complete training pass where the learning algorithm evaluates every single image in the training dataset exactly once."),
        ("Batch Size", "The discrete number of training samples processed simultaneously before calculating loss gradients and updating model weights."),
        ("Learning Rate", "A hyperparameter controlling the magnitude of weight adjustments made by the optimization algorithm during gradient descent."),
        ("Loss Function", "A mathematical equation measuring the discrepancy between a model's predicted output and the ground-truth target label."),
        ("Categorical Cross-Entropy", "The standard loss function for multi-class classification, calculating the negative logarithm of the probability assigned to the true label."),
        ("Optimizer (e.g., Adam)", "An algorithm that updates neural network weights based on computed gradients to minimize the loss function."),
        ("Gradient Descent", "An iterative optimization algorithm that calculates partial derivatives of the loss function to find parameter values that minimize error."),
        ("Overfitting", "When a model memorizes the training data too closely, achieving near-perfect training scores but failing on new, unseen test data."),
        ("Underfitting", "When a model is too simple to learn the underlying patterns in the dataset, performing poorly on both training and test data."),
        ("Early Stopping", "A training callback that monitors validation loss and automatically halts training when improvements plateau, preventing overfitting."),
        ("Data Augmentation", "Artificially creating modified copies of training images (rotation, zoom, contrast) to expose the model to diverse visual conditions."),
        ("Validation Data", "A held-out subset of data evaluated at the end of each epoch to tune hyperparameters and determine early stopping thresholds."),
        ("Test Data", "An independent partition of data evaluated strictly after training concludes to objectively measure real-world generalization."),
        ("Data Leakage", "An experimental error where information from the test dataset unintentionally contaminates the training pipeline, yielding falsely inflated accuracy."),
        ("Confusion Matrix", "A table visualizing the performance of a classifier, mapping ground-truth classes along rows and model predictions along columns."),
        ("Accuracy", "The proportion of total predictions that were correct: (True Positives + True Negatives) / Total Samples."),
        ("Precision", "The proportion of positive predictions that were truly correct: TP / (TP + FP). Measures avoidance of false positive errors."),
        ("Recall (Sensitivity)", "The proportion of actual target samples that were successfully detected by the model: TP / (TP + FN). Measures avoidance of false negatives."),
        ("F1-Score", "The harmonic mean of precision and recall: 2 * (Precision * Recall) / (Precision + Recall), balancing both metrics."),
        ("Inference", "The production execution phase where a trained, fixed neural network evaluates new input data and generates predictions."),
        ("TensorFlow Lite (TFLite)", "A specialized, lightweight inference engine and FlatBuffer model format designed for low-latency machine learning execution on edge devices."),
        ("Quantization", "Compressing neural network weights from 32-bit floating point down to 8-bit integers, drastically reducing file size and accelerating CPU operations."),
        ("FastAPI", "A high-performance asynchronous Python web framework used to expose machine learning models as high-throughput REST APIs."),
        ("ASGI (Asynchronous Server Gateway Interface)", "The standard interface for asynchronous Python web servers (like Uvicorn), handling concurrent I/O non-blockingly."),
        ("CORS (Cross-Origin Resource Sharing)", "A browser security header mechanism that controls whether a web page can make HTTP requests to a different domain name."),
        ("Firebase Authentication", "Google's managed cloud identity service handling password hashing, OAuth identity tokens, and user session persistence."),
        ("Firebase Realtime Database (RTDB)", "A cloud-hosted NoSQL database that synchronizes structured JSON data to connected clients via WebSockets in milliseconds."),
        ("Cloud Firestore", "Google's scalable document-oriented NoSQL cloud database used for flexible, queryable application record storage."),
        ("JWT (JSON Web Token)", "A compact, URL-safe, cryptographically signed token format used to transmit verified user authentication claims."),
        ("DTLS-SRTP", "Datagram Transport Layer Security combined with Secure Real-time Transport Protocol, providing mandatory encryption for WebRTC media packets."),
        ("Vercel", "A global cloud platform providing automated Git continuous deployment and edge Content Delivery Network (CDN) hosting for web applications."),
        ("Temporal Smoothing", "A signal stabilization filter requiring an AI prediction to remain identical across consecutive video frames before committing the letter."),
        ("Debouncing", "A timing mechanism that prevents sustained physical actions (like holding a gesture) from generating runaway duplicate characters."),
        ("MediaPipe Hands", "Google's open-source machine learning pipeline that tracks 21 3D anatomical hand landmarks in real time from standard RGB video."),
        ("Web Speech API", "A native browser API suite providing SpeechSynthesis (Text-to-Speech vocalization) and SpeechRecognition (voice transcription).")
    ]

    rows = []
    for term, definition in terms:
        rows.append(f"""
        <tr>
            <td style="font-weight: 700; color: #1e3a8a; width: 30%;">{term}</td>
            <td style="color: #334155; width: 70%;">{definition}</td>
        </tr>
        """)

    return f"""
    <section id="chapter-22" class="page-break">
        <h1>Chapter 22: Comprehensive Technical Glossary</h1>
        <p>
            This glossary provides precise, examiner-ready definitions for over 60 core technical terms spanning WebRTC networking, machine learning, computer vision, web engineering, cloud infrastructure, and accessibility.
        </p>

        <table>
            <thead>
                <tr>
                    <th>Technical Term</th>
                    <th>Plain-English Academic Definition</th>
                </tr>
            </thead>
            <tbody>
                {"".join(rows)}
            </tbody>
        </table>
    </section>
    """
