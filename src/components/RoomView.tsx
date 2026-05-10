import { useEffect, useRef, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc, collection, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import VideoPlayer from './VideoPlayer';
import Chat from './Chat';
import { Users, Link as LinkIcon, LogOut, Settings, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';

export default function RoomView() {
  const { user, room, setRoom, isHost, setIsHost, setParticipants } = useStore();
  const [showShare, setShowShare] = useState(false);
  const [videoSource, setVideoSource] = useState<string | File | null>(null);

  useEffect(() => {
    if (!room) return;

    // Subscribe to Room State
    const unsubRoom = onSnapshot(doc(db, 'rooms', room.id), (snapshot) => {
      if (snapshot.exists()) {
        setRoom(snapshot.data() as any);
      } else {
        // Room deleted by host
        setRoom(null);
      }
    });

    // Handle Presence
    const participantRef = doc(db, 'rooms', room.id, 'participants', user.uid);
    setDoc(participantRef, {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastSeen: serverTimestamp(),
      status: 'online'
    });

    // Cleanup presence on tab close
    const handleUnload = () => {
      deleteDoc(participantRef);
    };
    window.addEventListener('beforeunload', handleUnload);

    // Subscribe to Participants
    const unsubParticipants = onSnapshot(collection(db, 'rooms', room.id, 'participants'), (snapshot) => {
      const p = snapshot.docs.map(d => d.data() as any);
      setParticipants(p);
    });

    return () => {
      unsubRoom();
      unsubParticipants();
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
  }, [room?.id]);

  const leaveRoom = () => {
    setRoom(null);
    setIsHost(false);
  };

  const shareUrl = `${window.location.origin}?room=${room?.id}`;

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Sidebar - Video & Controls */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-white/5">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black">W</div>
            <h1 className="font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              {room?.videoTitle || 'Waiting for host...'}
            </h1>
            <div className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] uppercase font-black tracking-widest text-zinc-400">
              {room?.id}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowShare(true)}
              className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-zinc-400 hover:text-white"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button 
              onClick={leaveRoom}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all font-bold text-sm flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Leave Party
            </button>
          </div>
        </header>

        <main className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          <VideoPlayer 
            src={videoSource} 
            setSrc={setVideoSource}
          />
        </main>
      </div>

      {/* Right Rail - Chat & Participants */}
      <div className="w-96 flex flex-col bg-zinc-950 shrink-0">
        <Chat />
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShare(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-sm bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl space-y-8"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black italic">Invite your crew</h3>
                <p className="text-zinc-500 text-sm">Scan or copy to join the wave.</p>
              </div>

              <div className="flex justify-center p-4 bg-white rounded-3xl">
                <QRCodeSVG value={shareUrl} size={200} />
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-black rounded-2xl border border-white/5 flex items-center justify-between font-mono text-lg tracking-widest text-indigo-400">
                  {room?.id}
                  <button 
                    onClick={() => navigator.clipboard.writeText(room?.id || '')}
                    className="p-2 hover:bg-indigo-500/10 rounded-lg transition-colors"
                  >
                    <LinkIcon className="w-4 h-4 text-zinc-500" />
                  </button>
                </div>
                <button 
                  onClick={() => setShowShare(false)}
                  className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-bold transition-all text-sm"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
