"""
Chapter 7: WebRTC Video Communication & Multi-Peer Mesh Networking
"""

def get_chapter_7():
    return """
    <section id="chapter-7" class="page-break">
        <h1>Chapter 7: WebRTC Video Communication & Multi-Peer Mesh Networking</h1>

        <h2>7.1 WebRTC Fundamentals & Core Principles</h2>
        <p>
            <strong>WebRTC (Web Real-Time Communication)</strong> is an open-source standard and browser API suite that enables direct, encrypted, peer-to-peer audio, video, and arbitrary binary data streaming between web browsers without requiring third-party plugins or intermediate media relay servers.
        </p>

        <div class="note-box">
            <div class="note-box-title">Why WebRTC Was Chosen for SignMate</div>
            <ul style="margin-left: 15px; margin-bottom: 0;">
                <li><strong>Sub-Second Latency (&lt;200ms):</strong> Conventional HTTP video streaming (HLS, DASH) incurs 2–6 seconds of buffering delay, making real-time two-way sign conversation impossible. WebRTC operates over UDP with real-time RTP/RTCP feedback for instantaneous communication.</li>
                <li><strong>Native Browser Support:</strong> Implemented across Chromium, WebKit, and Gecko engines on desktop and mobile platforms.</li>
                <li><strong>End-to-End Encryption:</strong> Mandates DTLS (Datagram Transport Layer Security) and SRTP (Secure Real-time Transport Protocol) for all audio, video, and data channels.</li>
                <li><strong>Cost Freedom:</strong> Eliminates exorbitant recurring per-minute charges imposed by commercial proprietary SDKs (e.g., ZEGOCLOUD, Agora, Twilio).</li>
            </ul>
        </div>

        <h2>7.2 WebRTC Anatomy & Building Blocks</h2>
        <ul>
            <li><strong><code>navigator.mediaDevices.getUserMedia()</code>:</strong> Browser security API that requests explicit user consent to capture real-time video tracks from webcams and audio tracks from microphones.</li>
            <li><strong><code>MediaStream</code>:</strong> A container object grouping synchronized <code>MediaStreamTrack</code> instances (e.g., one video track and one audio track).</li>
            <li><strong><code>RTCPeerConnection</code>:</strong> The core state machine and network interface representing a WebRTC connection between the local browser and a remote peer. It handles codec negotiation, bandwidth adaptation, encryption, and packet transport.</li>
            <li><strong>SDP (Session Description Protocol):</strong> A standardized text payload describing media capabilities: codecs supported (VP8, VP9, H.264, Opus), video resolutions, network transport addresses, and encryption fingerprints.</li>
            <li><strong>SDP Offer & Answer:</strong> The two-step handshake. Peer A creates an <em>Offer</em> stating what it can send/receive. Peer B reviews the offer, matches compatible codecs, and responds with an <em>Answer</em>.</li>
            <li><strong>ICE (Interactive Connectivity Establishment):</strong> The framework used by WebRTC to find the best network path between two browsers across complex firewalls and NATs.</li>
            <li><strong>ICE Candidates:</strong> Network endpoints (IP addresses, ports, transport protocols) discovered by the browser (Host, Server Reflexive, or Relay).</li>
            <li><strong>STUN (Session Traversal Utilities for NAT):</strong> A lightweight server that reflects back the client's public-facing IP address and port as seen from the open Internet. SignMate uses Google's public STUN pool (<code>stun.l.google.com:19302</code>).</li>
            <li><strong>TURN (Traversal Using Relays around NAT):</strong> An intermediate relay server used when symmetric firewalls block direct P2P connections. (In SignMate's current deployment, STUN is verified; TURN is planned for enterprise restricted networks).</li>
        </ul>

        <h2>7.3 Why WebRTC Needs Signaling & Why It Is Separate from Media</h2>
        <div class="alert-box">
            <div class="alert-box-title">COMMON VIVA CONFUSION: SIGNALING VS. MEDIA TRANSPORT</div>
            <p>
                <strong>WebRTC does NOT define a signaling protocol.</strong> Two browsers in different homes cannot connect to each other because neither knows the other's public IP address, supported codecs, or cryptographic keys.
            </p>
            <p style="margin-bottom: 0;">
                Therefore, an external communication channel—the <strong>Signaling Server</strong>—is required <em>before</em> the call begins to exchange the SDP Offer, SDP Answer, and ICE candidates. Once this initial exchange finishes, the signaling server steps aside, and high-bandwidth video and audio stream <strong>directly peer-to-peer</strong> between the two browsers.
            </p>
        </div>

        <h2>7.4 SignMate's Resilient 3-Layer Signaling Architecture</h2>
        <p>
            To guarantee connectivity across local development, multi-tab testing, and global cloud deployment, <code>WebRTCService.ts</code> implements a hierarchical 3-layer signaling strategy:
        </p>

        <div class="diagram-container">
            <svg viewBox="0 0 760 200" width="100%" height="auto" style="max-height: 180px;" xmlns="http://www.w3.org/2000/svg">
                <rect width="760" height="200" fill="#f8fafc" rx="6"/>
                <!-- Layer 1 -->
                <rect x="25" y="30" width="220" height="140" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" rx="6" />
                <text x="135" y="55" font-family="Inter, sans-serif" font-size="11" font-weight="bold" fill="#1e40af" text-anchor="middle">LAYER 1: BROWSER CHANNEL</text>
                <text x="135" y="80" font-family="Inter, sans-serif" font-size="9" font-weight="bold" fill="#0f172a" text-anchor="middle">BroadcastChannel API</text>
                <text x="135" y="105" font-family="Inter, sans-serif" font-size="8" fill="#475569" text-anchor="middle">Channel: signmate_room_{id}</text>
                <text x="135" y="130" font-family="Inter, sans-serif" font-size="8" fill="#1e40af" text-anchor="middle">Instant 0ms multi-tab test sync</text>
                <text x="135" y="150" font-family="Inter, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">Zero network roundtrip required</text>

                <!-- Layer 2 -->
                <rect x="270" y="30" width="220" height="140" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5" rx="6" />
                <text x="380" y="55" font-family="Inter, sans-serif" font-size="11" font-weight="bold" fill="#065f46" text-anchor="middle">LAYER 2: LOCAL FASTAPI HUB</text>
                <text x="380" y="80" font-family="Inter, sans-serif" font-size="9" font-weight="bold" fill="#0f172a" text-anchor="middle">REST Long-Polling / WebSockets</text>
                <text x="380" y="105" font-family="Inter, sans-serif" font-size="8" fill="#475569" text-anchor="middle">Endpoint: /api/v1/webrtc/{id}/signals</text>
                <text x="380" y="130" font-family="Inter, sans-serif" font-size="8" fill="#047857" text-anchor="middle">Local LAN peer coordination</text>
                <text x="380" y="150" font-family="Inter, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">Operates without internet access</text>

                <!-- Layer 3 -->
                <rect x="515" y="30" width="220" height="140" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5" rx="6" />
                <text x="625" y="55" font-family="Inter, sans-serif" font-size="11" font-weight="bold" fill="#92400e" text-anchor="middle">LAYER 3: FIREBASE RTDB (PRIMARY)</text>
                <text x="625" y="80" font-family="Inter, sans-serif" font-size="9" font-weight="bold" fill="#0f172a" text-anchor="middle">Cloud WebSocket Bus (Google)</text>
                <text x="625" y="105" font-family="Inter, sans-serif" font-size="8" fill="#475569" text-anchor="middle">Path: rooms/{id}/mesh/{pairKey}</text>
                <text x="625" y="130" font-family="Inter, sans-serif" font-size="8" fill="#b45309" text-anchor="middle">Global production signaling bus</text>
                <text x="625" y="150" font-family="Inter, sans-serif" font-size="7.5" fill="#64748b" text-anchor="middle">Auto onDisconnect cleanup hooks</text>
            </svg>
            <div class="diagram-caption">Figure 7.1: SignMate Three-Tier Hybrid Signaling Architecture</div>
        </div>

        <h2>7.5 Up to Four Participants: Full-Mesh Topology Analysis</h2>
        <p>
            In video conferencing, multi-user architectures fall into three categories: <strong>Mesh</strong>, <strong>SFU (Selective Forwarding Unit)</strong>, or <strong>MCU (Multipoint Control Unit)</strong>.
        </p>
        <p>
            SignMate utilizes a <strong>Full Mesh Topology</strong>. In a full mesh, there is no central media server. Every participant connects directly to every other participant via an independent <code>RTCPeerConnection</code>.
        </p>

        <div class="note-box">
            <div class="note-box-title">Mathematical Formula for Mesh Connections</div>
            <p>
                For $N$ participants in a room:
            </p>
            <ul>
                <li>Each individual client maintains $N - 1$ active peer connections and sends $N - 1$ video streams.</li>
                <li>The total number of bidirectional peer connections in the room is:
                    <br><br>
                    $$\\text{Total Connections} = \\frac{N(N - 1)}{2}$$
                </li>
            </ul>
            <p style="margin-bottom: 0;">
                For SignMate's maximum room limit of <strong>$N = 4$ participants</strong>:
                <br>
                $$\\text{Total Connections} = \\frac{4(4 - 1)}{2} = \\frac{12}{2} = \\mathbf{6}\\text{ active WebRTC connections in the room.}$$
                Each client uploads 3 video streams and downloads 3 video streams. For standard 720p at 1.2 Mbps, each client requires approximately 3.6 Mbps upload and download bandwidth, which modern broadband handles comfortably.
            </p>
        </div>

        <h2>7.6 Glare Prevention: Deterministic Initiator Ordering</h2>
        <p>
            A common bug in multi-peer WebRTC mesh networks is <em>glare</em>—a race condition occurring when Peer A and Peer B simultaneously send each other an SDP Offer at the same millisecond, causing both connection state machines to fail.
        </p>
        <p>
            SignMate eliminates glare deterministically in <code>WebRTCService.ts</code>:
        </p>
        <div class="code-title">File: src/services/WebRTCService.ts (Lines 279, 490–496)</div>
<pre><code>// 1. Generate unique deterministic pair key for RTDB signaling path
const pairKey = [this.clientId, remoteId].sort().join('_to_');

// 2. Lexicographical comparison prevents glare
const isInitiator = this.clientId &lt; remoteId;

if (isInitiator) {
  // Only the lexicographically smaller ID creates the offer
  const offer = await peer.pc.createOffer();
  await peer.pc.setLocalDescription(offer);
  await set(ref(db, `rooms/${roomId}/mesh/${pairKey}/offer`), { sdpInit: offer, senderId: this.clientId });
} else {
  // The larger ID passively listens for the offer, sets remote description, and answers
  listenForRemoteOffer(pairKey);
}
</code></pre>

        <h2>7.7 Source Code Walkthrough: Peer Connection & Track Binding</h2>
        <p>
            The following function from <code>WebRTCService.ts</code> instantiates and configures a dedicated peer connection:
        </p>

        <div class="code-title">File: src/services/WebRTCService.ts (Lines 122–165)</div>
<pre><code>  private getOrCreatePeer(remoteId: string): MeshPeer {
    let peer = this.meshPeers.get(remoteId);
    if (peer) return peer;

    const pc = new RTCPeerConnection(RTC_CONFIG);
    const stream = new MediaStream();

    peer = {
      peerId: remoteId,
      pc,
      stream,
      queuedCandidates: [],
      processedCandidates: new Set(),
    };
    this.meshPeers.set(remoteId, peer);

    // Add local tracks (webcam video + mic audio) to this peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Capture incoming remote media tracks from this specific peer
    pc.ontrack = (event) => {
      let remoteStr = peer!.stream;
      if (event.streams && event.streams[0]) {
        remoteStr = event.streams[0];
        peer!.stream = remoteStr;
      } else {
        remoteStr.addTrack(event.track);
      }
      this.callbacks?.onPeerStream?.(remoteId, remoteStr);
    };

    return peer;
  }
</code></pre>

        <h2>7.8 Crucial Distinction: Four Stages of WebRTC Connection Verification</h2>
        <ol>
            <li><strong>Stage 1: Successful UI Room Join:</strong> The user entered a room code, and the React router loaded <code>RoomPage.tsx</code>. (Does <em>not</em> mean anyone else is connected).</li>
            <li><strong>Stage 2: Successful Signaling Connection:</strong> The browser successfully opened a WebSocket to Firebase RTDB and registered its presence in <code>rooms/{id}/peers</code>.</li>
            <li><strong>Stage 3: Successful Peer Connection:</strong> SDP offers and answers were negotiated, ICE candidates succeeded, and <code>pc.connectionState === 'connected'</code>.</li>
            <li><strong>Stage 4: Actual Remote Media Playback:</strong> <code>pc.ontrack</code> fired, received audio/video tracks, attached the <code>MediaStream</code> to an HTML <code>&lt;video&gt;</code> element, and successfully invoked <code>video.play()</code>.</li>
        </ol>

        <h2>7.9 Examiner Viva Question & Model Answer</h2>
        <div class="viva-card viva-trap">
            <div class="viva-q">Examiner Question: "How did you implement a four-person video call without using ZEGOCLOUD or external paid SDKs?"</div>
            <div class="viva-a">
                <strong>Model Candidate Answer:</strong><br>
                "We implemented a browser-native <strong>Full Mesh WebRTC topology</strong> using standard <code>RTCPeerConnection</code> APIs provided directly by modern web browsers.<br><br>
                Instead of paying for ZEGOCLOUD media servers, each participant maintains a direct peer-to-peer connection with every other participant in the room. For 4 participants, each client maintains 3 connections, resulting in 6 total connections across the room.<br><br>
                To coordinate the connections, we built a 3-tier signaling mechanism using <strong>Firebase Realtime Database</strong> as the primary cloud signaling bus. We eliminated connection glare by comparing client IDs lexicographically so only one peer initiates the offer. Video packets stream directly between user machines over encrypted UDP (SRTP), completely bypassing external media servers and incurring zero recurring costs."
            </div>
        </div>
    </section>
    """
