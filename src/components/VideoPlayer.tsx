import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Play, Pause, RotateCcw, Volume2, Maximize2, Upload, Link as LinkIcon, Settings } from 'lucide-react';
import { formatTime } from '../lib/utils';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import EmojiReactions from './EmojiReactions';

interface VideoPlayerProps {
  src: string | File | null;
  setSrc: (src: string | File | null) => void;
}

export default function VideoPlayer({ src, setSrc }: VideoPlayerProps) {
  const { room, isHost, user } = useStore();
  const playerRef = useRef<ReactPlayer>(null);
  const [urlInput, setUrlInput] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [localPlaying, setLocalPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [seeking, setSeeking] = useState(false);
  const [lastSync, setLastSync] = useState(0);

  const controlsTimeout = useRef<any>(null);

  // Sync Logic
  useEffect(() => {
    if (!room || seeking) return;

    const drift = Math.abs(playerRef.current?.getCurrentTime() || 0 - room.currentTime);
    
    // Auto-resync if drift > 0.5s or if state changed
    if (drift > 0.5 || localPlaying !== room.playing) {
      if (playerRef.current) {
        playerRef.current.seekTo(room.currentTime, 'seconds');
      }
      setLocalPlaying(room.playing);
    }
  }, [room?.playing, room?.currentTime]);

  // Host Sync Interval
  useEffect(() => {
    if (!isHost || !room || !playerRef.current || !localPlaying) return;

    const interval = setInterval(async () => {
      const currentTime = playerRef.current?.getCurrentTime() || 0;
      await updateDoc(doc(db, 'rooms', room.id), {
        currentTime,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: user.uid
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isHost, localPlaying, room?.id]);

  const handlePlayPause = async () => {
    if (!isHost) return;
    const newPlaying = !localPlaying;
    setLocalPlaying(newPlaying);
    await updateDoc(doc(db, 'rooms', room!.id), {
      playing: newPlaying,
      currentTime: playerRef.current?.getCurrentTime() || 0,
      updatedAt: serverTimestamp(),
      lastUpdatedBy: user.uid
    });
  };

  const handleSeek = async (e: any) => {
    if (!isHost) return;
    const time = parseFloat(e.target.value);
    playerRef.current?.seekTo(time);
    await updateDoc(doc(db, 'rooms', room!.id), {
      currentTime: time,
      updatedAt: serverTimestamp(),
      lastUpdatedBy: user.uid
    });
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setSrc(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    noClick: true,
    accept: { 'video/*': ['.mp4', '.mkv', '.webm'] } 
  });

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
  };

  if (!src) {
    return (
      <div {...getRootProps()} className="w-full h-full flex items-center justify-center bg-zinc-900 border-2 border-dashed border-white/5 m-12 rounded-[3rem] transition-colors hover:border-indigo-500/20">
        <input {...getInputProps()} />
        <div className="max-w-md w-full p-8 text-center space-y-10">
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-indigo-600/10 rounded-full flex items-center justify-center text-indigo-500 animate-pulse">
              <Upload className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black">Ready to sync?</h3>
              <p className="text-zinc-500 font-medium">Drop a video file here or use a stream link.</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/5" />
            <span className="relative z-10 px-4 bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-600">OR</span>
          </div>

          <div className="flex gap-2 p-2 bg-black rounded-2xl border border-white/5">
            <input 
              type="text" 
              placeholder="Paste URL (YouTube, Vimeo, MP4...)" 
              className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-sm font-medium"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <button 
              onClick={() => setSrc(urlInput)}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black uppercase transition-all"
            >
              Stream
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-8 pt-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase text-zinc-600">Auto Sync</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase text-zinc-600">DRM Free</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const videoUrl = typeof src === 'string' ? src : URL.createObjectURL(src);

  return (
    <div 
      className="w-full h-full relative bg-black group"
      onMouseMove={handleMouseMove}
    >
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        playing={localPlaying}
        volume={volume}
        onProgress={({ playedSeconds }) => !seeking && isHost && setLastSync(playedSeconds)}
        style={{ pointerEvents: isHost ? 'auto' : 'none' }}
        config={{
          file: {
            attributes: {
              crossOrigin: "anonymous"
            }
          }
        }}
      />

      <AnimatePresence>
        {showControls && (
          <>
            <EmojiReactions />
            <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-4"
          >
            {/* Seek Bar */}
            <div className="relative group/seeker">
              <input 
                type="range"
                min={0}
                max={playerRef.current?.getDuration() || 0}
                value={playerRef.current?.getCurrentTime() || 0}
                onChange={handleSeek}
                disabled={!isHost}
                className="w-full h-1.5 appearance-none bg-white/20 rounded-full cursor-pointer overflow-hidden [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-0 [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:shadow-[-100vw_0_0_100vw_#4f46e5]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button 
                  onClick={handlePlayPause}
                  className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all outline-none"
                >
                  {localPlaying ? <Pause className="fill-black" /> : <Play className="fill-black ml-1" />}
                </button>

                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-tighter tabular-nums">
                    {formatTime(playerRef.current?.getCurrentTime() || 0)}
                  </span>
                  <span className="text-[10px] uppercase font-black text-zinc-500">
                    {formatTime(playerRef.current?.getDuration() || 0)}
                  </span>
                </div>

                <div className="flex items-center gap-3 group/vol ml-4">
                  <Volume2 className="w-5 h-5 text-zinc-400" />
                  <input 
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 accent-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  {isHost ? 'Acting as Master' : 'Synced to Host'}
                </div>
                <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-zinc-400">
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
        )}
      </AnimatePresence>
    </div>
  );
}
