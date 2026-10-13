"""
Chapter 6: Website Implementation & UI Modules
"""

def get_chapter_6():
    return """
    <section id="chapter-6" class="page-break">
        <h1>Chapter 6: Website Implementation & UI Architecture</h1>

        <h2>6.1 Component-Based Frontend Architecture</h2>
        <p>
            SignMate is implemented using React 19's functional component paradigm combined with TypeScript interfaces. The design pattern strictly separates presentation components (dumb views) from stateful hook containers and service adapters.
        </p>

        <table>
            <thead>
                <tr>
                    <th>Page / View</th>
                    <th>Route Path</th>
                    <th>Primary Components Used</th>
                    <th>Key Responsibilities</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Landing Page</strong></td>
                    <td><code>/</code></td>
                    <td><code>Navbar</code>, <code>SignMateLogo</code>, <code>VoxelBackground</code>, <code>Footer</code></td>
                    <td>Brand presentation, accessibility value propositions, interactive feature demonstration, routing to auth.</td>
                </tr>
                <tr>
                    <td><strong>Authentication</strong></td>
                    <td><code>/login</code>, <code>/register</code></td>
                    <td><code>Input</code>, <code>Button</code>, <code>SocialAuthButtons</code></td>
                    <td>Email/password validation, Firebase Auth token acquisition, Google OAuth popups, error feedback.</td>
                </tr>
                <tr>
                    <td><strong>Dashboard Hub</strong></td>
                    <td><code>/dashboard</code></td>
                    <td><code>UserSidebar</code>, <code>CreateRoomModal</code>, <code>JoinRoomModal</code></td>
                    <td>Main user command center: 1-click room creation, 6-character room joining, navigation to offline tools.</td>
                </tr>
                <tr>
                    <td><strong>Conference Room</strong></td>
                    <td><code>/room/:roomId</code></td>
                    <td><code>VideoGrid</code>, <code>ParticipantTile</code>, <code>CallControls</code>, <code>HandLandmarkOverlay</code></td>
                    <td>WebRTC multi-participant video conference, real-time sign recognition loop, subtitle streaming, speech synthesis.</td>
                </tr>
                <tr>
                    <td><strong>Offline Practice</strong></td>
                    <td><code>/practice</code></td>
                    <td><code>UserSidebar</code>, <code>HandLandmarkOverlay</code>, <code>RecognitionPanel</code></td>
                    <td>Single-user sandbox for rehearsing fingerspelling gestures with visual bounding box and accuracy metrics.</td>
                </tr>
                <tr>
                    <td><strong>Support & Feedback</strong></td>
                    <td><code>/support</code></td>
                    <td><code>UserSidebar</code>, <code>Accordion</code></td>
                    <td>Platform FAQ, troubleshooting tips, direct user feedback reporting mechanism.</td>
                </tr>
            </tbody>
        </table>

        <h2>6.2 State Management via Custom React Hooks</h2>
        <p>
            SignMate rejects heavy external state management libraries (Redux, MobX) in favor of lightweight, composable React Context hooks:
        </p>
        <ul>
            <li><strong><code>useAuth()</code>:</strong> Subscribes to <code>onAuthStateChanged()</code> from Firebase Auth, providing <code>user</code>, <code>loading</code>, <code>login()</code>, <code>register()</code>, and <code>logout()</code> globally.</li>
            <li><strong><code>useMediaDevices()</code>:</strong> Manages browser hardware access via <code>navigator.mediaDevices.getUserMedia()</code>. Exposes <code>localStream</code>, <code>isCameraEnabled</code>, <code>isMicEnabled</code>, <code>toggleCamera()</code>, and <code>toggleMicrophone()</code>.</li>
            <li><strong><code>useSignAI()</code>:</strong> Manages recognition state (<code>aiState: 'active' | 'off'</code>), character buffers, dictionary suggestions, and speech synthesis invocations.</li>
            <li><strong><code>useToast()</code>:</strong> Dispatches non-blocking, accessible toast alerts with auto-dismiss timers.</li>
        </ul>

        <h2>6.3 Source Code Spotlight: Camera & Microphone Hardware Controller</h2>
        <p>
            The following code snippet from <code>src/hooks/useMediaDevices.ts</code> demonstrates how SignMate acquires and controls camera/mic tracks:
        </p>

        <div class="code-title">File: src/hooks/useMediaDevices.ts (Lines 25–65)</div>
<pre><code>export function useMediaDevices(): UseMediaDevicesResult {
  const [localStream, setLocalStream] = useState&lt;MediaStream | null&gt;(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [deviceError, setDeviceError] = useState&lt;string | null&gt;(null);

  const startLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      setLocalStream(stream);
      setDeviceError(null);
    } catch (err: any) {
      console.error('Camera/Mic permission denied or unavailable:', err);
      setDeviceError(err.message || 'Permission denied');
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);
</code></pre>

        <div class="note-box">
            <div class="note-box-title">Code Analysis & Examiner Insights</div>
            <p>
                <strong>Input:</strong> User browser trigger granting camera permissions.<br>
                <strong>Output:</strong> <code>MediaStream</code> containing active 720p video and audio tracks.<br>
                <strong>Why <code>videoTrack.enabled = false</code> instead of <code>track.stop()</code>?</strong> Calling <code>track.stop()</code> completely releases hardware locks, which tears down the WebRTC renegotiation pipeline and requires prompting the user for permissions again. Toggling <code>enabled = false</code> transmits black video frames across WebRTC while keeping the peer connection completely stable.
            </p>
        </div>

        <h2>6.4 Source Code Spotlight: Accessible Sign Recognition Hook</h2>
        <p>
            The snippet below from <code>src/hooks/useSignAI.ts</code> illustrates character appending, dictionary querying, and text-to-speech vocalization:
        </p>

        <div class="code-title">File: src/hooks/useSignAI.ts (Lines 69–86, 129–136)</div>
<pre><code>  const appendCharacter = useCallback((char: string) => {
    setRecognition((r) => {
      const nextText = r.recognizedText + char.toUpperCase();
      const words = nextText.split(/\\s+/);
      const lastWord = (words[words.length - 1] || '').toUpperCase();

      // Query words starting with this prefix from dictionary_compact.json
      const suggestions = dictionaryService.getWordSuggestions(lastWord, 8);

      return {
        ...r,
        recognizedText: nextText,
        currentPrediction: char.toUpperCase(),
        confidence: 0.97,
        suggestions,
      };
    });
  }, []);

  const speakRecognizedText = useCallback(() => {
    if (!window.speechSynthesis || !recognition.recognizedText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(recognition.recognizedText);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
    announceToScreenReader(`Speaking: ${recognition.recognizedText}`);
  }, [recognition.recognizedText]);
</code></pre>

        <h2>6.5 Responsive Layout & Video Aspect Ratio Management</h2>
        <p>
            In video conferencing, cropped video displays often cut off users' hands, preventing sign language communication. SignMate resolves this through user-selectable aspect modes:
        </p>
        <ul>
            <li><strong>Cover Mode (Default):</strong> Scales video edge-to-edge (<code>object-cover</code>) for an immersive full-screen view.</li>
            <li><strong>Contain Mode:</strong> Renders 100% of the camera sensor frame (<code>object-contain</code>) with letterboxing, guaranteeing that signers' hands and arms are completely visible regardless of device aspect ratio.</li>
        </ul>
    </section>
    """
