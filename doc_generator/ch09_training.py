"""
Chapter 9: Model Training, Transfer Learning & Evaluation Metrics
"""

def get_chapter_9():
    return """
    <section id="chapter-9" class="page-break">
        <h1>Chapter 9: Model Training, Transfer Learning & Evaluation Metrics</h1>

        <h2>9.1 Model Architecture & Layer Topology</h2>
        <p>
            The sign recognition backbone of SignMate is a custom deep convolutional neural network based on <strong>MobileNetV3Small</strong>, pre-trained on ImageNet and adapted using transfer learning for single-channel grayscale fingerspelling recognition.
        </p>

        <table>
            <thead>
                <tr>
                    <th>Layer Name</th>
                    <th>Type</th>
                    <th>Output Tensor Shape</th>
                    <th>Param Count</th>
                    <th>Architectural Function</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>image</code></td>
                    <td>InputLayer</td>
                    <td>(None, 160, 160, 1)</td>
                    <td>0</td>
                    <td>Receives single-channel float32 grayscale image (pixel values 0–255).</td>
                </tr>
                <tr>
                    <td><code>augmentation</code></td>
                    <td>Sequential</td>
                    <td>(None, 160, 160, 1)</td>
                    <td>0</td>
                    <td>RandomRotation, RandomTranslation, RandomZoom, RandomContrast.</td>
                </tr>
                <tr>
                    <td><code>concatenate_1</code></td>
                    <td>Concatenate</td>
                    <td>(None, 160, 160, 3)</td>
                    <td>0</td>
                    <td><strong>Grayscale-to-RGB Bridge:</strong> Stacks grayscale channel 3 times to feed 3-channel MobileNet.</td>
                </tr>
                <tr>
                    <td><code>MobileNetV3Small</code></td>
                    <td>Functional</td>
                    <td>(None, 5, 5, 576)</td>
                    <td>939,120</td>
                    <td>Pre-trained ImageNet feature extractor (frozen during Stage 1).</td>
                </tr>
                <tr>
                    <td><code>global_average_pool</code></td>
                    <td>GlobalAveragePooling2D</td>
                    <td>(None, 576)</td>
                    <td>0</td>
                    <td>Reduces spatial 5×5 feature grids to a compact 576-element feature vector.</td>
                </tr>
                <tr>
                    <td><code>dropout_2</code></td>
                    <td>Dropout (0.2)</td>
                    <td>(None, 576)</td>
                    <td>0</td>
                    <td>Regularization layer; randomly zeroes 20% of activations to prevent overfitting.</td>
                </tr>
                <tr>
                    <td><code>dense_1</code></td>
                    <td>Dense (ReLU)</td>
                    <td>(None, 128)</td>
                    <td>73,856</td>
                    <td>Trainable classification layer learning high-level sign gesture representations.</td>
                </tr>
                <tr>
                    <td><code>dropout_3</code></td>
                    <td>Dropout (0.2)</td>
                    <td>(None, 128)</td>
                    <td>0</td>
                    <td>Second regularization layer preventing feature co-adaptation.</td>
                </tr>
                <tr>
                    <td><code>output</code></td>
                    <td>Dense (Softmax)</td>
                    <td>(None, 27)</td>
                    <td>3,483</td>
                    <td>Outputs normalized probability distribution across all 27 target classes.</td>
                </tr>
            </tbody>
        </table>

        <div class="note-box">
            <div class="note-box-title">Verified Parameter Summary</div>
            <ul style="margin-left: 15px; margin-bottom: 0;">
                <li><strong>Total Parameters:</strong> <strong>1,171,139</strong> (approx. 4.47 MB uncompressed)</li>
                <li><strong>Trainable Parameters (Stage 1):</strong> <strong>77,339</strong> (302.11 KB) — Only classification head trained.</li>
                <li><strong>Non-trainable Parameters (Stage 1):</strong> <strong>939,120</strong> (3.58 MB) — Pretrained ImageNet weights frozen.</li>
                <li><strong>Optimizer Parameters:</strong> <strong>154,680</strong> (604.22 KB) — Adam first and second moment vectors.</li>
            </ul>
        </div>

        <h2>9.2 Twenty-Five Essential Machine Learning Concepts Explained Simply</h2>
        <div class="note-box" style="font-size: 8.5pt;">
            <ol style="margin-left: 15px; margin-bottom: 0;">
                <li><strong>Machine Learning:</strong> Teaching computers to recognize patterns from examples instead of hand-coding thousands of explicit if-else rules.</li>
                <li><strong>Image Classification:</strong> Taking an input image and assigning it a single category label (e.g., photo → "Letter B").</li>
                <li><strong>CNN (Convolutional Neural Network):</strong> A neural network architecture designed specifically for grid-like data (images) using sliding filters to detect spatial patterns.</li>
                <li><strong>Convolutional Layer:</strong> Applies small mathematical filter matrices (e.g., 3×3) across an image to detect edges, curves, corners, and textures.</li>
                <li><strong>Feature Extraction:</strong> Transforming raw pixels into meaningful representations (e.g., detecting finger tips, closed fists, thumb angles).</li>
                <li><strong>MobileNetV3Small:</strong> An ultra-lightweight, efficient CNN developed by Google for mobile devices using depthwise separable convolutions and squeeze-and-excitation blocks.</li>
                <li><strong>Transfer Learning:</strong> Taking a model pre-trained on a massive general dataset (ImageNet with 1.4M images) and repurposing its learned features for our specific sign language task.</li>
                <li><strong>Pretrained ImageNet Weights:</strong> Starting our model with pre-existing knowledge of edges, textures, and shapes rather than starting from complete random noise.</li>
                <li><strong>Removing Classifier Top (<code>include_top=False</code>):</strong> Discarding ImageNet's original 1,000-class output layer (which classified dogs, cars, planes) so we can attach our custom 27-class head.</li>
                <li><strong>Dense Layer (Fully Connected):</strong> A layer where every artificial neuron connects to every neuron in the preceding layer to synthesize high-level decisions.</li>
                <li><strong>Dropout:</strong> A regularization technique that randomly deactivates a fraction of neurons during training to force the network to learn robust, redundant features.</li>
                <li><strong>Softmax Activation:</strong> A mathematical function that converts raw logits into a clean probability distribution that sums to exactly 1.0 (100%).</li>
                <li><strong>Epoch:</strong> One complete pass through the entire training dataset (all 12,845 images seen once).</li>
                <li><strong>Batch Size:</strong> The number of images processed together before updating the model's weights (e.g., 32 or 64 images per batch).</li>
                <li><strong>Learning Rate:</strong> The step size taken by the optimizer when adjusting model weights. A rate of 0.001 is common for transfer learning.</li>
                <li><strong>Loss Function (Categorical Cross-Entropy):</strong> A mathematical penalty measuring how far the model's predictions deviate from ground-truth labels. Lower loss indicates better performance.</li>
                <li><strong>Validation Data:</strong> A held-out subset of data evaluated at the end of each epoch to verify if the model is genuinely learning or merely memorizing.</li>
                <li><strong>Early Stopping:</strong> Automatically halting training when validation loss stops improving, preventing overfitting and saving compute time.</li>
                <li><strong>Data Augmentation:</strong> Artificially expanding the training dataset by applying random rotations, translations, zooms, and contrast shifts to mimic diverse real-world webcam conditions.</li>
                <li><strong>Overfitting:</strong> When a model memorizes the training images perfectly (like memorizing exam question answers) but fails when tested on unseen images.</li>
                <li><strong>Accuracy:</strong> The percentage of total predictions that were completely correct: $(TP + TN) / \\text{Total}$.</li>
                <li><strong>Precision:</strong> Out of all images the model predicted as 'A', what fraction was truly 'A'? Measures avoidance of false positives.</li>
                <li><strong>Recall (Sensitivity):</strong> Out of all actual 'A' images in the dataset, what fraction did the model find? Measures avoidance of false negatives.</li>
                <li><strong>F1-Score:</strong> The harmonic mean of precision and recall ($2 \\cdot (P \\cdot R) / (P + R)$), providing a balanced metric especially on imbalanced data.</li>
                <li><strong>Confusion Matrix:</strong> A 27×27 grid where rows represent true classes and columns represent predicted classes, visually revealing which letters get confused.</li>
            </ol>
        </div>

        <h2>9.3 Historical Training & Evaluation Performance Metrics</h2>
        <p>
            During training on the 12,845 image training partition:
        </p>
        <ul>
            <li><strong>Epoch 4 Milestone:</strong> Best validation accuracy reached <strong>100.00%</strong> with a validation loss of <strong>0.0078</strong>.</li>
            <li><strong>Early Stopping Triggered:</strong> Training completed at <strong>Epoch 7</strong> when validation loss plateaued. The checkpoint was saved as <code>SignMate_stage1_best.keras</code>.</li>
        </ul>

        <div class="success-box">
            <div class="success-box-title">Official Independent Test Set Evaluation (4,268 Test Images)</div>
            <table style="margin-top: 6px; margin-bottom: 0;">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Measured Value</th>
                        <th>Academic Interpretation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Test Accuracy</strong></td>
                        <td><strong>97.00%</strong></td>
                        <td>Correctly classified 4,140 out of 4,268 previously unseen test images.</td>
                    </tr>
                    <tr>
                        <td><strong>Test Loss</strong></td>
                        <td><strong>0.1045</strong></td>
                        <td>Low cross-entropy loss indicating high model prediction confidence.</td>
                    </tr>
                    <tr>
                        <td><strong>Macro Precision</strong></td>
                        <td><strong>0.9739</strong> (97.39%)</td>
                        <td>Average precision computed equally across all 27 individual classes.</td>
                    </tr>
                    <tr>
                        <td><strong>Macro Recall</strong></td>
                        <td><strong>0.9703</strong> (97.03%)</td>
                        <td>Average sensitivity across all 27 classes.</td>
                    </tr>
                    <tr>
                        <td><strong>Macro F1-Score</strong></td>
                        <td><strong>0.9704</strong> (97.04%)</td>
                        <td>Harmonic balance of precision and recall across all classes.</td>
                    </tr>
                    <tr>
                        <td><strong>Weighted F1-Score</strong></td>
                        <td><strong>0.9702</strong> (97.02%)</td>
                        <td>F1-score weighted by the support count of each individual class.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h2>9.4 Why 100% Validation Accuracy Differs from 97% Test Accuracy</h2>
        <div class="note-box">
            <p>
                <strong>Examiner Viva Question:</strong> "Why did your model show 100% accuracy at validation epoch 4, but 97% on the final test set?"
            </p>
            <p style="margin-bottom: 0;">
                <strong>Candidate Answer:</strong> "The validation split (used for early stopping callbacks) shares very similar distribution characteristics with the training batches (e.g., similar camera distance and subject lighting). The <strong>independent test set</strong> of 4,268 images contains completely separate physical captures with distinct hand shapes, angles, and lighting conditions. Achieving 97.00% on this completely independent evaluation proves that the model generalized successfully without catastrophic overfitting."
            </p>
        </div>

        <h2>9.5 Why High Test Accuracy Does NOT Guarantee 100% Live Webcam Performance</h2>
        <div class="alert-box">
            <div class="alert-box-title">CRITICAL EXAM DEFENSE: TEST ACCURACY VS. LIVE REALITY</div>
            <p style="margin-bottom: 4px;">
                <strong>Do not claim every live sign in front of a webcam has 97% accuracy.</strong>
            </p>
            <p style="margin-bottom: 0;">
                Static benchmark datasets feature centered hands with controlled lighting and uniform contrast. Real-world live webcams introduce significant noise: motion blur from fast movement, backlighting from windows, camera sensor grain in dim rooms, hand distance variations, and natural anatomical differences in finger flexibility. This is precisely why SignMate implements <strong>temporal smoothing (requiring 2 stable consecutive frames)</strong>, <strong>confidence filtering (&gt;=0.70)</strong>, and <strong>MediaPipe hand region-of-interest cropping</strong> to bridge the domain gap between lab datasets and live video calls.
            </p>
        </div>

        <h2>9.6 Transition from MediaPipe Landmarks + GRU to MobileNetV3Small</h2>
        <p>
            An earlier prototype explored feeding 21 MediaPipe coordinate vectors $(x, y, z)$ into a Gated Recurrent Unit (GRU) sequence network. However, that pipeline was abandoned for critical engineering reasons:
        </p>
        <ol>
            <li><strong>Severe Cascade Error:</strong> If MediaPipe failed to detect a finger landmark due to poor lighting or self-occlusion (fingers overlapping), the coordinates became NaN or jumped wildly, causing the GRU model to fail immediately.</li>
            <li><strong>Visual Information Loss:</strong> Coordinate landmarks completely discard texture, palm orientation, depth shadows, and skin boundary cues that a Convolutional Neural Network naturally observes from raw pixels.</li>
            <li><strong>Simplicity & Robustness:</strong> MobileNetV3Small processes image pixels directly, making it significantly more resilient to minor finger occlusions than pure landmark coordinates.</li>
        </ol>
    </section>
    """
