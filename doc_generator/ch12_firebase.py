"""
Chapter 12: Firebase Authentication, Realtime Database & Security Boundaries
"""

def get_chapter_12():
    return """
    <section id="chapter-12" class="page-break">
        <h1>Chapter 12: Firebase Authentication, Realtime Database & Security Boundaries</h1>

        <h2>12.1 Firebase Ecosystem Role in SignMate</h2>
        <p>
            Firebase acts as SignMate's serverless cloud infrastructure backbone, fulfilling three distinct roles without requiring custom Node.js server maintenance:
        </p>
        <ol>
            <li><strong>Firebase Authentication:</strong> Manages secure user registration, password hashing, and OAuth tokens.</li>
            <li><strong>Firebase Realtime Database (RTDB):</strong> Provides high-speed WebSocket message routing for WebRTC signaling (SDP and ICE exchange).</li>
            <li><strong>Cloud Firestore:</strong> Stores persistent meeting room records and participant rosters.</li>
        </ol>

        <h2>12.2 Authentication vs. Authorization (Essential Exam Concept)</h2>
        <div class="note-box">
            <div class="note-box-title">VIVA DEFINITIONS: AUTHENTICATION VS. AUTHORIZATION</div>
            <p>
                <strong>Authentication (Who are you?):</strong> The process of verifying a user's claimed identity. SignMate authenticates users using email/password or Google credentials via Firebase Auth. Output: a verified User ID (UID).
            </p>
            <p style="margin-bottom: 0;">
                <strong>Authorization (What are you allowed to do?):</strong> The process of checking whether an authenticated user has permission to access a specific resource or perform an action. In SignMate, Firestore Security Rules verify if a user has permission to join a room, delete a room, or read participant messages.
            </p>
        </div>

        <h2>12.3 Real-Time Signaling via Firebase RTDB</h2>
        <p>
            The Realtime Database structure is organized around ephemeral room paths that automatically clean up when participants disconnect:
        </p>

        <pre><code>signmate-a73b3-default-rtdb.firebaseio.com/
└── rooms/
    └── X8LN7A/
        ├── peers/
        │   ├── peer_abc123/ { "id": "peer_abc123", "joinedAt": 1728912345 }
        │   └── peer_xyz789/ { "id": "peer_xyz789", "joinedAt": 1728912350 }
        └── mesh/
            └── peer_abc123_to_peer_xyz789/
                ├── offer/       { "sdpInit": {...}, "senderId": "peer_abc123" }
                ├── answer/      { "sdpInit": {...}, "senderId": "peer_xyz789" }
                └── candidates/
                    ├── peer_abc123/ { "-Nxy1...": { "candidate": "...", "sdpMid": "0" } }
                    └── peer_xyz789/ { "-Nxy2...": { "candidate": "...", "sdpMid": "0" } }
</code></pre>

        <div class="note-box">
            <div class="note-box-title">Automatic Garbage Collection: onDisconnect()</div>
            <p style="margin-bottom: 0;">
                When a user closes their laptop or loses Wi-Fi connection, standard WebSockets can hang. SignMate uses Firebase's <code>onDisconnect(ref).remove()</code> hook. The Firebase cloud server monitors the persistent TCP socket; the moment the client drops, Firebase automatically deletes their presence node and offer/answer trees, immediately notifying other peers that the user has left.
            </p>
        </div>

        <h2>12.4 Firestore Room Persistence & Security Rules</h2>
        <p>
            Room metadata is persisted in Cloud Firestore under the <code>rooms</code> collection:
        </p>

        <div class="code-title">File: firestore.rules</div>
<pre><code>rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.hostId;

      match /participants/{participantId} {
        allow read, write: if true;
      }
    }
  }
}
</code></pre>

        <h2>12.5 Why Frontend Firebase API Keys are Safe to Expose</h2>
        <div class="alert-box">
            <div class="alert-box-title">COMMON EXAMINER TRAP: "ARE YOUR FIREBASE KEYS LEAKED IN JS?"</div>
            <p>
                <strong>Examiner Question:</strong> "Your <code>config.ts</code> file contains <code>apiKey: 'AIzaSyDRvd-...'</code> in the frontend bundle. Isn't that a severe security vulnerability?"
            </p>
            <p style="margin-bottom: 0;">
                <strong>Candidate Answer:</strong> "No, respected examiner. In Firebase client architecture, the <code>apiKey</code> is an <strong>application identifier</strong> used to route requests to the correct Google Cloud project—it is not an administrative secret. Firebase security is enforced by <strong>Firestore Security Rules</strong> and <strong>Firebase Auth JWT tokens</strong> evaluated on Google's cloud servers, not by keeping the client API key hidden. Sensitive administrative keys (such as the Firebase Admin SDK private key) are never included in the frontend."
            </p>
        </div>
    </section>
    """
