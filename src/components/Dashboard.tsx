import { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import { generateRoomCode } from '../lib/utils';
import { Plus, LogIn, Monitor, Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user, setRoom, setIsHost } = useStore();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createRoom = async () => {
    setLoading(true);
    const code = generateRoomCode();
    try {
      const roomData = {
        id: code,
        hostId: user.uid,
        hostName: user.displayName || 'Anonymous',
        playing: false,
        currentTime: 0,
        playbackRate: 1,
        lastUpdatedBy: user.uid,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'rooms', code), roomData);
      setRoom({ ...roomData, updatedAt: new Date() } as any);
      setIsHost(true);
    } catch (err) {
      setError('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode) return;
    setLoading(true);
    setError('');
    try {
      const roomDoc = await getDoc(doc(db, 'rooms', roomCode.toUpperCase()));
      if (roomDoc.exists()) {
        setRoom(roomDoc.data() as any);
        setIsHost(roomDoc.data().hostId === user.uid);
      } else {
        setError('Room not found. Check the code.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
      <header className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <img 
            src={user.photoURL} 
            alt={user.displayName} 
            className="w-12 h-12 rounded-full border-2 border-indigo-500/50"
          />
          <div>
            <h2 className="font-bold text-lg">{user.displayName}</h2>
            <p className="text-xs text-zinc-500 uppercase font-black">Logged In</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400 text-sm font-bold flex items-center gap-2">
            <Users className="w-4 h-4" />
            2.4k Watching Now
          </div>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Create Room */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-zinc-900 border border-white/5 p-8 rounded-[2rem] space-y-6 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-500">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black">Create a Room</h3>
            <p className="text-zinc-400">Host your own session and invite friends to watch together.</p>
          </div>
          <button
            onClick={createRoom}
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating...' : 'Launch Room'}
            <Monitor className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Join Room */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-zinc-900 border border-white/5 p-8 rounded-[2rem] space-y-6"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400">
              <LogIn className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black">Join a Room</h3>
            <p className="text-zinc-400">Have a code? Paste it below to sync with your party.</p>
          </div>
          <form onSubmit={joinRoom} className="space-y-4">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ENTER 6-DIGIT CODE"
              className="w-full py-4 bg-black border border-white/10 rounded-2xl px-6 text-center text-xl font-mono tracking-[0.5em] focus:outline-none focus:border-indigo-500/50 transition-all"
              maxLength={6}
            />
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            <button
              type="submit"
              disabled={loading || !roomCode}
              className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join Party'}
            </button>
          </form>
        </motion.div>
      </div>

      <div className="text-center py-12 border-t border-white/5">
        <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest italic">
          "The best way to watch, together."
        </p>
      </div>
    </div>
  );
}
