# SignMate — AI-Assisted Inclusive Communication

> **MCA Final-Year Project Presentation & Technical Viva Voce**  
> **Candidate:** Muhammed Rashid KP (Register No: `TVE25MCA-2046`)  
> **Institution:** Department of Computer Applications, College of Engineering Trivandrum (TVE)  
> **Live Web Application:** [signmate-ashy.vercel.app](https://signmate-ashy.vercel.app/)

---

## 📄 Complete Project Documentation & Viva Voce Guide
- **[SignMate Complete Project Documentation & Viva Guide (PDF)](./SignMate_Complete_Project_Documentation_and_Viva_Guide.pdf)** — Comprehensive 71-page academic project documentation including all 22 chapters, system architectures, full WebRTC math, MobileNetV3Small layer audits, and 110 categorized viva questions with deep model answers.
- **[Editable Source Document (HTML)](./SignMate_Complete_Project_Documentation_and_Viva_Guide.html)** — Standalone source document used to compile the PDF.
- **[Edge TFLite Model](./SignMate_MobileNetV3Small.tflite)** — Converted 3.88 MB TensorFlow Lite model (`[1, 160, 160, 1]` input, 27 output classes).

---

## Architecture Overview

```text
                    SIGNMATE WEB (React 19 + TypeScript + Vite)
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                │                                │
     Firebase                         WebRTC                           FastAPI
  Auth / Firestore / RTDB           Full Mesh P2P                    AI Inference
        │                         (Up to 4 Callers)                       │
        │                                │                           Keras / TFLite
        │                                │                         (MobileNetV3Small)
        │                                │                           97% Test Accuracy
        │                                │                                │
        │                                │                                ↓
        │                                │                         27 Classes (0-26)
        │                                │                                │
        │                                │                                ↓
        │                                │                        Dictionary Engine
        │                                │                       (95,000+ Word Cache)
        └────────────────────────────────┴────────────────────────────────┘
                                         │
                        UI, Subtitles & Speech Synthesis
```

- **Web Frontend (Vercel)**: React 19, TypeScript, Tailwind CSS, MediaPipe Hands.
- **P2P Video Conferencing (Native WebRTC)**: 4-participant full mesh ($N(N-1)/2 = 6$ connections), Google STUN, encrypted DTLS-SRTP UDP media plane.
- **Signaling Bus (Firebase RTDB)**: 3-tier signaling (BroadcastChannel, LAN FastAPI, Google RTDB) with deterministic glare prevention (`this.clientId < remoteId`).
- **AI Recognition (MobileNetV3Small)**: 27 classes (Class 0 = background/neutral, Classes 1–26 = letters A–Z). Input `[1, 160, 160, 1]` float32 grayscale (0–255 range).
- **Language Assistance**: Client-side 95,000-word dictionary service prioritizing high-frequency conversational phrases with sub-2ms prefix lookups.


---

## Modular Folder Structure

```text
signmate/
├── .env.example             # Safe environment variable configuration template
├── index.html               # Accessible HTML document entry with Google Fonts
├── package.json             # React 19, TypeScript, Tailwind CSS, Lucide React
├── tailwind.config.js       # Accessible high-contrast color palette & 44px min touch targets
├── tsconfig.json
├── src/
│   ├── main.tsx             # Application bootstrap
│   ├── App.tsx              # Routing, layout, and global providers
│   ├── index.css            # Tailwind directives, focus-visible styles, custom scrollbars
│   ├── auth/                # Authentication components
│   │   └── SocialAuthButtons.tsx
│   ├── rooms/               # Room management components
│   │   ├── CreateRoomModal.tsx
│   │   ├── JoinRoomModal.tsx
│   │   └── RoomCodeBadge.tsx
│   ├── video/               # Video conference integration layer
│   │   ├── zegoConfig.ts
│   │   └── zegoVideoService.ts
│   ├── ai/                  # AI inference layer
│   │   ├── fastApiConfig.ts
│   │   └── fastApiAIService.ts
│   ├── gemini/              # Gemini suggestion proxy layer
│   │   ├── geminiConfig.ts
│   │   └── geminiSuggestionsService.ts
│   ├── firebase/            # Firebase client adapters
│   │   ├── config.ts
│   │   ├── firebaseAuth.ts
│   │   └── firestoreRooms.ts
│   ├── services/            # Isolated service contracts & singletons
│   │   ├── AuthService.ts
│   │   ├── RoomService.ts
│   │   ├── VideoService.ts
│   │   ├── AIService.ts
│   │   └── GeminiService.ts
│   ├── components/          # Reusable accessible UI components
│   │   ├── Button.tsx       # 44px touch targets, loading states, variants
│   │   ├── Input.tsx        # Accessible labels, aria-invalid, error texts
│   │   ├── Modal.tsx        # Dialog semantics, Escape key dismiss, focus trap
│   │   ├── EmptyState.tsx   # Clean non-fake empty placeholder
│   │   ├── StatusBadge.tsx  # Non-color-only status indicators
│   │   ├── Navbar.tsx       # Responsive navigation with mobile drawer
│   │   ├── Footer.tsx       # Semantic footer with platform links
│   │   ├── ToastContainer.tsx
│   │   ├── video/           # Conference video components
│   │   │   ├── RoomHeader.tsx
│   │   │   ├── VideoGrid.tsx
│   │   │   ├── ParticipantTile.tsx
│   │   │   ├── CallControls.tsx
│   │   │   └── ParticipantsDrawer.tsx
│   │   └── ai/              # Sign recognition components
│   │       ├── AIControl.tsx
│   │       └── RecognitionPanel.tsx
│   ├── pages/               # Application routes
│   │   ├── LandingPage.tsx   # Route: /
│   │   ├── LoginPage.tsx     # Route: /login
│   │   ├── RegisterPage.tsx  # Route: /register
│   │   ├── DashboardPage.tsx # Route: /dashboard
│   │   ├── RoomPage.tsx      # Route: /room/:roomId
│   │   └── NotFoundPage.tsx  # Route: *
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.tsx       # Firebase-ready auth state & guest preview mode
│   │   ├── useMediaDevices.ts# WebRTC camera/microphone permissions & stream management
│   │   ├── useSignAI.ts      # AI state, recognizedText, suggestions, speech synthesis
│   │   └── useToast.tsx      # Accessible screen-reader announced notifications
│   ├── types/               # TypeScript definitions
│   │   ├── auth.ts
│   │   ├── room.ts
│   │   ├── video.ts
│   │   ├── ai.ts
│   │   └── gemini.ts
│   └── utils/               # Helper utilities
│       ├── roomCode.ts      # SM-XXXXXX room code generator & validator
│       ├── validators.ts    # Form validation utilities
│       └── a11y.ts          # ARIA screen-reader announcer utilities
```

---

## Routes & Pages

1. **Landing Page (`/`)**:
   - Clean hero presentation with tagline: *"AI-Assisted Inclusive Communication"*
   - Primary CTA: *"Get Started"*, Secondary CTA: *"Join a Room"*
   - Value propositions: Small group rooms (3–5 participants), MobileNetV3 alphabet recognition, and contextual suggestions.

2. **Authentication (`/login`, `/register`)**:
   - Ready for Firebase Auth integration
   - Email/password and Google authentication buttons
   - Clean guest preview mode for immediate evaluation without setup

3. **Dashboard (`/dashboard`)**:
   - Welcome banner and active session details
   - Quick action buttons: *"Create Room"* and *"Join Room"*
   - Clean empty state for Recent Rooms (no fake mock records)
   - Profile summary and architecture readiness status

4. **Room Communication (`/room/:roomId`)**:
   - Format-validated room codes (`SM-XXXXXX`, e.g., `SM-952JW`)
   - `RoomHeader`: Room code badge with one-click clipboard copy, live indicator, participant count (1–5)
   - `VideoGrid`: Adaptive grid layout for 1 to 5 participants
   - `ParticipantTile`: Video stream attachment, camera-off avatar fallback, mic mute badge, active speaker indicator
   - `CallControls`: Mic toggle, camera toggle, compact `🤖 AI` / `🤖 AI ON` toggle, participants toggle, and danger-red Leave button
   - `RecognitionPanel`: Compact panel showing accumulated recognized letters, real-time suggestion chips (`[HELLO]`, `[HELP]`, `[HEALTH]`), confidence badge, and Text-to-Speech playback
   - Responsive layout adapting seamlessly from 320px mobile to 1440px+ wide displays

---

## Accessibility (a11y) Features

- **Keyboard Navigation**: Full tab ordering with visible high-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-brand-400`).
- **Touch Target Sizes**: All controls and buttons meet the >= 44x44px minimum touch target requirement (`min-h-touch min-w-touch`).
- **Screen Reader Announcements**: Live regions via `announceToScreenReader` for toast alerts, room code copying, and recognition toggles.
- **Non-Color-Only Indicators**: All status pills and error states combine iconography, shapes, and descriptive text.
- **Skip Link**: Accessible skip-to-main-content landmark on every page.
- **Reduced Motion**: Respects `prefers-reduced-motion` with zero disruptive layout shifts.

---

## Running Locally

### Development Server:
```bash
npm run dev
```

### Production Build:
```bash
npm run build
```

### Preview Production Build:
```bash
npm run preview -- --port 5173
```
