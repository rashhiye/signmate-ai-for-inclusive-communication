"""
Chapter 15: Testing Evidence & System Verification Matrix
"""

def get_chapter_15():
    return """
    <section id="chapter-15" class="page-break">
        <h1>Chapter 15: Testing Evidence & System Verification Matrix</h1>

        <h2>15.1 Academic Testing Methodology</h2>
        <p>
            System testing for SignMate was executed across unit, integration, and end-to-end user evaluation tiers. All test scenarios are rigorously documented with their confirmed empirical outcome and architectural verification evidence.
        </p>

        <table>
            <thead>
                <tr>
                    <th style="width: 8%;">Test ID</th>
                    <th style="width: 22%;">Test Scenario</th>
                    <th style="width: 25%;">Expected Result</th>
                    <th style="width: 25%;">Actual Result</th>
                    <th style="width: 10%;">Status</th>
                    <th style="width: 10%;">Evidence</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>TC-01</strong></td>
                    <td>Landing Page Load on Production URL</td>
                    <td>Renders marketing header, hero graphic, accessibility badges in &lt;1.5s.</td>
                    <td>Renders correctly with 200 OK from Vercel Edge CDN.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td>Vercel deployment logs</td>
                </tr>
                <tr>
                    <td><strong>TC-02</strong></td>
                    <td>User Account Registration</td>
                    <td>New user record created in Firebase Auth; auto-redirects to <code>/dashboard</code>.</td>
                    <td>Firebase Auth creates user; token stored in IndexedDB.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td>Firebase Auth Console UID</td>
                </tr>
                <tr>
                    <td><strong>TC-03</strong></td>
                    <td>Invalid Login Credentials</td>
                    <td>Shows error alert "Invalid email or password"; prevents access.</td>
                    <td>Toast error triggers; form remains populated for correction.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td>UI Toast message verified</td>
                </tr>
                <tr>
                    <td><strong>TC-04</strong></td>
                    <td>Room Creation Flow</td>
                    <td>Generates unique 6-character room code; creates Firestore record.</td>
                    <td>Code (e.g., <code>X8LN7A</code>) generated; routes to <code>/room/X8LN7A</code>.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td>Firestore document write</td>
                </tr>
                <tr>
                    <td><strong>TC-05</strong></td>
                    <td>Join Valid Room Code</td>
                    <td>Validates code against Firestore; admits user into active call.</td>
                    <td>Successfully loads call UI and initializes WebRTC signaling.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td>Room document validation</td>
                </tr>
                <tr>
                    <td><strong>TC-06</strong></td>
                    <td>Join Invalid / Non-Existent Room</td>
                    <td>Displays error alert "Room not found or ended"; aborts entry.</td>
                    <td>Error banner displayed; user remains safely on dashboard.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td>Toast error notification</td>
                </tr>
                <tr>
                    <td><strong>TC-07</strong></td>
                    <td>Two Participants in Same Room</td>
                    <td>Both users exchange SDP offers/answers and see remote video.</td>
                    <td>P2P video and audio stream established successfully.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td>Multi-tab & multi-device test</td>
                </tr>
                <tr>
                    <td><strong>TC-08</strong></td>
                    <td>Four Participants Joining Call</td>
                    <td>Full mesh established; 6 bidirectional links active.</td>
                    <td>All 4 participant video tiles render simultaneously in grid.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td>Firebase RTDB 4-peer mesh</td>
                </tr>
                <tr>
                    <td><strong>TC-09</strong></td>
                    <td>Exceeding 4-Participant Limit</td>
                    <td>Fifth participant rejected with alert "Room is full (max 4)".</td>
                    <td>Entry blocked; toast error "Room Full" triggered.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td><code>activePeerIds.length &gt;= 4</code> guard</td>
                </tr>
                <tr>
                    <td><strong>TC-10</strong></td>
                    <td>Camera Hardware Permissions Denied</td>
                    <td>Shows helpful error banner advising user to enable camera in browser.</td>
                    <td>Renders <code>deviceError</code> banner; app does not crash.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td><code>useMediaDevices</code> error state</td>
                </tr>
                <tr>
                    <td><strong>TC-11</strong></td>
                    <td>Audio Mute & Video Pause Toggle</td>
                    <td>Toggles track enabled state; transmits black frames / silence.</td>
                    <td>Track enabled state toggles cleanly; connection stays alive.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td><code>MediaStreamTrack.enabled</code> check</td>
                </tr>
                <tr>
                    <td><strong>TC-12</strong></td>
                    <td>Participant Disconnection & Cleanup</td>
                    <td>Remote tile removed cleanly; peer connection closed.</td>
                    <td><code>onDisconnect()</code> cleans RTDB path; tile unmounts.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td>Firebase RTDB node removal</td>
                </tr>
                <tr>
                    <td><strong>TC-13</strong></td>
                    <td>FastAPI Server Startup & Model Load</td>
                    <td>Loads <code>SignMate_stage1_best.keras</code> and outputs input shape.</td>
                    <td>Server logs: "Model loaded successfully! [1, 160, 160, 1]".</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td>Server stdout log verified</td>
                </tr>
                <tr>
                    <td><strong>TC-14</strong></td>
                    <td>Valid Sign Image Inference ('A'–'Z')</td>
                    <td>Returns correct letter label with confidence &gt;= 0.90.</td>
                    <td>Classified test letter with high probability and sub-50ms latency.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td><code>/api/v1/predict</code> JSON response</td>
                </tr>
                <tr>
                    <td><strong>TC-15</strong></td>
                    <td>Neutral Background Frame (Class 0)</td>
                    <td>Outputs predicted_class 0; label mapped to empty string <code>""</code>.</td>
                    <td>Class 0 returned; no false character committed to text.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td><code>fastapi_server.py</code> line 218</td>
                </tr>
                <tr>
                    <td><strong>TC-16</strong></td>
                    <td>Low-Confidence Gesture Filtering</td>
                    <td>Predictions with confidence &lt;0.70 discarded.</td>
                    <td>Transitional frames ignored; text buffer unaffected.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td><code>RoomPage.tsx</code> threshold check</td>
                </tr>
                <tr>
                    <td><strong>TC-17</strong></td>
                    <td>Intentional Double-Letter Hold (1.5s)</td>
                    <td>Holding sign for 13 frames appends duplicate letter (e.g., 'LL').</td>
                    <td>Hold count increments; duplicate letter appended on frame 13.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td>Debounce hold counter test</td>
                </tr>
                <tr>
                    <td><strong>TC-18</strong></td>
                    <td>Dictionary Prefix Word Suggestions</td>
                    <td>Typing/signing 'HEL' returns ['HELLO', 'HELP', ...].</td>
                    <td>Returns top 8 conversational suggestions in &lt;2ms.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td><code>dictionaryService.ts</code> unit test</td>
                </tr>
                <tr>
                    <td><strong>TC-19</strong></td>
                    <td>Speech Synthesis Vocalization</td>
                    <td>Browser vocalizes recognized text through audio output.</td>
                    <td><code>window.speechSynthesis</code> speaks utterance clearly.</td>
                    <td><strong style="color: #16a34a;">PASS</strong></td>
                    <td>Audio output verified</td>
                </tr>
                <tr>
                    <td><strong>TC-20</strong></td>
                    <td>Symmetric NAT Network Traversal</td>
                    <td>P2P connection succeeds across strict corporate firewalls.</td>
                    <td>STUN alone may fail without TURN relay in strict NAT.</td>
                    <td><strong style="color: #ca8a04;">PARTIAL</strong></td>
                    <td>STUN verified; TURN pending</td>
                </tr>
                <tr>
                    <td><strong>TC-21</strong></td>
                    <td>Continuous Dynamic Sentence Translation</td>
                    <td>Model translates full grammatical ISL sentence with motion.</td>
                    <td>Model currently classifies isolated static alphabet signs only.</td>
                    <td><strong style="color: #64748b;">NOT TESTED</strong></td>
                    <td>Future Phase 6 enhancement</td>
                </tr>
                <tr>
                    <td><strong>TC-22</strong></td>
                    <td>Gemini Generative Sentence Rewriting</td>
                    <td>Gemini restructuring partial words into formal sentences.</td>
                    <td>Proxy adapter interface defined; pending live server key.</td>
                    <td><strong style="color: #64748b;">NOT TESTED</strong></td>
                    <td>Phase 5 planned feature</td>
                </tr>
            </tbody>
        </table>

        <h2>15.2 Confirmed Machine Learning Model Metrics</h2>
        <p>
            The reported test evaluation metrics on the 4,268 unseen benchmark images are:
        </p>
        <ul>
            <li><strong>Accuracy:</strong> 97.00%</li>
            <li><strong>Loss:</strong> 0.1045</li>
            <li><strong>Macro Precision:</strong> 0.9739</li>
            <li><strong>Macro Recall:</strong> 0.9703</li>
            <li><strong>Macro F1-Score:</strong> 0.9704</li>
            <li><strong>Maximum Observed Probability Error (Keras vs. TFLite):</strong> $2.38 \\times 10^{-7}$</li>
        </ul>
    </section>
    """
