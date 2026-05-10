import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { useStore } from '../store/useStore';

export const useWebRTC = (roomId: string) => {
  const { user } = useStore();
  const [peers, setPeers] = useState<any[]>([]);
  const socketRef = useRef<any>();
  const peersRef = useRef<any[]>([]);

  useEffect(() => {
    socketRef.current = io(window.location.origin);
    socketRef.current.emit('join-room', roomId);

    socketRef.current.on('all-users', (users: string[]) => {
      const peers: any[] = [];
      users.forEach(userID => {
        const peer = createPeer(userID, socketRef.current.id, socketRef.current);
        peersRef.current.push({
          peerID: userID,
          peer,
        });
        peers.push(peer);
      });
      setPeers(peers);
    });

    socketRef.current.on('user-joined', (payload: any) => {
      const peer = addPeer(payload.signal, payload.callerID, socketRef.current);
      peersRef.current.push({
        peerID: payload.callerID,
        peer,
      });
      setPeers(prev => [...prev, peer]);
    });

    socketRef.current.on('receiving-returned-signal', (payload: any) => {
      const item = peersRef.current.find(p => p.peerID === payload.id);
      item.peer.signal(payload.signal);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  function createPeer(userToSignal: string, callerID: string, socket: any) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
    });

    peer.on('signal', signal => {
      socket.emit('sending-signal', { userToSignal, callerID, signal });
    });

    return peer;
  }

  function addPeer(incomingSignal: any, callerID: string, socket: any) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
    });

    peer.on('signal', signal => {
      socket.emit('returning-signal', { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  return { peers };
};
