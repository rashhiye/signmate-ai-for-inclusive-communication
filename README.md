# SignMate — AI-Assisted Inclusive Communication

SignMate is a modern, production-ready web platform engineered to bridge communication between sign-language users and English-speaking users. It combines small-group video conferencing (3–5 participants), on-device ISL gesture alphabet recognition, and contextual word predictions in a clean, highly accessible communication interface.

---

## Architecture

```text
                    SIGNMATE WEB
                         │
        ┌────────────────┼────────────────┐
        │                │                │
     Firebase        ZEGOCLOUD         FastAPI
     Auth/DB        Video Conference    AI API
        │                │                │
        │                │            Keras model
        │                │         (MobileNetV3Small)
        │                │                │
        │                │                ↓
        │                │             A–Z (27 classes)
        │                │                │
        │                │                ↓
        │                │             Gemini
        │                │       (Contextual Suggestions)
        │                │                │
        └────────────────┴────────────────┘
                         │
                        UI
```

- **Firebase (Client SDK / Auth & Firestore - Phase 2)**:
  - User authentication (Email/Password, Google Sign-in)
  - Room metadata & participant presence persistence (`rooms/{roomId}/participants/{uid}`)
- **ZEGOCLOUD (Conference Web SDK - Phase 3)**:
  - Audio and video conferencing for 3–5 participants
  - Camera & microphone media streams
- **FastAPI (AI Inference - Phase 4)**:
  - Loads the trained `SignMate_MobileNetV3Small` model (~97% test accuracy, 27 classes: 0 = background, 1–26 = A–Z)
  - Accepts [1, 160, 160, 1] grayscale frames (0–255 pixel range)
- **Gemini (Contextual Suggestions - Phase 5)**:
  - Backend proxy converts recognized letter sequences into contextual words and phrases
  - *Browser never contains Gemini API secrets or ZEGOCLOUD server secrets.*

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
