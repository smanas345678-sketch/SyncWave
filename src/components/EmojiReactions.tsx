import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';

const EMOJIS = ['❤️', '😂', '😮', '😢', '🔥', '👏', '💯', '🍿'];

export default function EmojiReactions() {
  const { room } = useStore();
  const [socket, setSocket] = useState<any>(null);
  const [reactions, setReactions] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);

  useEffect(() => {
    const s = io(window.location.origin);
    setSocket(s);
    if (room) s.emit('join-room', room.id);

    s.on('reaction', ({ emoji }) => {
      addReaction(emoji);
    });

    return () => {
      s.disconnect();
    };
  }, [room?.id]);

  const addReaction = (emoji: string) => {
    const id = Math.random().toString();
    const x = 20 + Math.random() * 60; // 20-80% horizontal
    const y = 20 + Math.random() * 60; // 20-80% vertical
    setReactions(prev => [...prev, { id, emoji, x, y }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 3000);
  };

  const sendReaction = (emoji: string) => {
    if (socket && room) {
      socket.emit('reaction', { roomId: room.id, emoji });
      addReaction(emoji);
    }
  };

  return (
    <>
      {/* Floating Reactions Area */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {reactions.map(r => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, scale: 0, y: 0 }}
              animate={{ opacity: 1, scale: 1.5, y: -100 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute text-5xl z-50 transition-all"
              style={{ left: `${r.x}%`, top: `${r.y}%` }}
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Selector (Bottom Right in Player) */}
      <div className="absolute right-8 bottom-32 flex flex-col gap-2 p-3 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl">
        <div className="grid grid-cols-2 gap-2">
          {EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => sendReaction(e)}
              className="w-10 h-10 flex items-center justify-center hover:scale-125 transition-transform text-xl"
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
