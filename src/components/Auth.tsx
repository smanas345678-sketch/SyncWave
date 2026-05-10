import { useState } from 'react';
import { signInWithGoogle } from '../lib/firebase';
import { motion } from 'motion/react';
import { LogIn, Play } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b,transparent_70%)]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center space-y-8"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.4)] transform rotate-12">
            <Play className="w-10 h-10 text-white fill-white -rotate-12 ml-1" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-white">SyncWave</h1>
          <p className="text-zinc-400 font-medium">Watch movies in perfect sync with your friends.</p>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full h-14 relative group overflow-hidden bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform" />
          <LogIn className="w-5 h-5 relative z-10 group-hover:text-white transition-colors" />
          <span className="relative z-10 group-hover:text-white transition-colors">
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </span>
        </button>

        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">
          No installation required • P2P Optimized • 300ms Low Latency
        </p>
      </motion.div>
    </div>
  );
}
