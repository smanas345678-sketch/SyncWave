# SyncWave

SyncWave is a production-ready, low-latency movie synchronization platform. It allows users to watch local video files or streaming URLs in perfect sync across multiple devices using WebRTC and Firebase.

## 🚀 Features

- **Perfect Sync**: Play, pause, and seek synchronization with drift correction (<300ms).
- **WebRTC P2P**: Direct peer-to-peer data channels for low-latency state updates.
- **Room System**: Create or join watch parties via 6-digit codes or dynamic QR codes.
- **Multiple Video Sources**: Support for local file uploads (MP4, MKV) and direct streaming URLs.
- **Glassmorphism UI**: A modern, Netflix-inspired interface with fluid animations.
- **Real-time Chat**: Integrated party chat and shared emoji reactions.
- **PWA Support**: Installable on Android and iOS for a native-like experience.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion.
- **State**: Zustand.
- **Realtime**: Firebase Firestore (Signaling), Socket.io (Signaling Fallback).
- **P2P**: Simple-Peer (WebRTC).

## 📦 Installation & Setup

1. **Environment Variables**:
   Ensure `.env` contains:
   ```env
   GEMINI_API_KEY=your_key_here
   ```

2. **Firebase Setup**:
   This app uses Firebase for signaling and room state. Ensure `firebase-applet-config.json` is correctly provisioned by the setup tool.

3. **Development**:
   ```bash
   npm install
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

## 📱 PWA Installation (Android/iOS)

1. Open the application URL in Chrome (Android) or Safari (iOS).
2. Tap "Add to Home Screen" from the browser menu.
3. Launch "SyncWave" from your home screen for full-screen immersive mode.

## ⚖️ License
Apache-2.0
