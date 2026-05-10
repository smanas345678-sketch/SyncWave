import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import { Send, Hash, Users, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatTime } from '../lib/utils';

export default function Chat() {
  const { user, room, messages, setMessages, participants } = useStore();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!room) return;

    const q = query(
      collection(db, 'rooms', room.id, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const m = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setMessages(m);
    });

    return () => unsubscribe();
  }, [room?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !room) return;

    const messageText = text;
    setText('');

    await addDoc(collection(db, 'rooms', room.id, 'messages'), {
      userId: user.uid,
      userName: user.displayName,
      text: messageText,
      type: 'text',
      timestamp: serverTimestamp()
    });
  };

  const [activeTab, setActiveTab] = useState<'chat' | 'party'>('chat');

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-white/5">
      <div className="h-16 flex border-b border-white/5">
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'text-indigo-500 bg-white/5 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-white'}`}
        >
          <MessageSquare className="w-4 h-4" />
          Chat
        </button>
        <button 
          onClick={() => setActiveTab('party')}
          className={`flex-1 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'party' ? 'text-indigo-500 bg-white/5 border-b-2 border-indigo-500' : 'text-zinc-500 hover:text-white'}`}
        >
          <Users className="w-4 h-4" />
          Party ({participants.length})
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' ? (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0 flex flex-col p-6 overflow-y-auto space-y-4"
              ref={scrollRef}
            >
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.userId === user.uid ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500">{m.userName}</span>
                    <span className="text-[10px] text-zinc-700">{m.timestamp ? new Date(m.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}</span>
                  </div>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-medium ${m.userId === user.uid ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="party"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0 p-6 space-y-6"
            >
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Active Participants</h4>
              <div className="space-y-4">
                {participants.map((p) => (
                  <div key={p.uid} className="flex items-center gap-3">
                    <div className="relative">
                      <img src={(p as any).photoURL} className="w-10 h-10 rounded-xl" alt="" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-zinc-950 rounded-full" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{p.displayName}</div>
                      <div className="text-[10px] font-black uppercase text-zinc-600 tracking-tighter italic">Synchronized</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {activeTab === 'chat' && (
        <form onSubmit={sendMessage} className="p-4 bg-zinc-900 border-t border-white/5 space-y-3">
          <div className="flex gap-2 p-2 bg-black rounded-2xl border border-white/5">
            <input 
              type="text" 
              placeholder="React to the scene..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-transparent px-2 py-2 focus:outline-none text-sm placeholder:text-zinc-600"
            />
            <button 
              type="submit"
              className="p-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all active:scale-90"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
