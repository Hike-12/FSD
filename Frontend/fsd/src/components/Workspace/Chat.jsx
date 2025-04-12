import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { Camera, Mic, MicOff, Monitor, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { DJANGO_BASE_URL, NODE_BASE_URL } from "@/lib/utils";

const SOCKET_URL = window.location.hostname === "localhost" ? "http://localhost:5000" : "http://192.168.0.110:5000/";

const Chat = () => {
  const { teamId } = useParams();
  const userId = localStorage.getItem("userId") || "user-" + Math.floor(Math.random() * 1000);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [remoteUserIds, setRemoteUserIds] = useState([]);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Refs
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnections = useRef({});
  const remoteVideoRefs = useRef({});
  const remoteUsers = useRef({});

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add this useEffect to handle setting the video source after render
  useEffect(() => {
    if (isVideoCallActive && localStreamRef.current && localVideoRef.current) {
      console.log("Setting video source in useEffect");
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [isVideoCallActive, localStreamRef.current]);

  const startVideoCall = async () => {
    try {
      console.log("Starting video call...");
      
      // Initialize local media stream
      if (!localStreamRef.current) {
        console.log("Getting user media...");
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log("Media stream obtained:", localStreamRef.current.id);
      }
      
      // Set active state - the useEffect will handle setting the srcObject
      setIsVideoCallActive(true);
      socketRef.current.emit("joinCall", teamId);
      
      // Notify existing participants about the new user
      remoteUserIds.forEach((remoteUserId) => {
        handleUserJoined(remoteUserId);
      });
    } catch (error) {
      console.error("Error starting video call:", error);
      alert("Could not access camera/microphone. Please check permissions.");
    }
  };

  const endVideoCall = () => {
    Object.values(peerConnections.current).forEach(connection => connection.close());
    peerConnections.current = {};
    setRemoteUserIds([]);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    Object.values(remoteVideoRefs.current).forEach(video => {
      if (video) video.srcObject = null;
    });

    setIsVideoCallActive(false);
    socketRef.current.emit("leaveCall", teamId);
  };

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.emit("joinRoom", { team_id: teamId, user_id: userId });
    
    socketRef.current.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    
    socketRef.current.on("error", (data) => {
      alert(data.message);
    });
    
    return () => {
      socketRef.current.disconnect();
    };
  }, [teamId, userId]);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${NODE_BASE_URL}/messages?team_id=${teamId}`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [teamId]);

  // WebRTC signaling setup
  useEffect(() => {
    if (!socketRef.current) return;
    
    socketRef.current.on("userJoined", ({ userId: remoteUserId }) => {
      setRemoteUserIds(prev => [...prev, remoteUserId]);
      handleUserJoined(remoteUserId);
    });
    
    socketRef.current.on("userLeft", ({ userId: remoteUserId }) => {
      setRemoteUserIds(prev => prev.filter(id => id !== remoteUserId));
      if (peerConnections.current[remoteUserId]) {
        peerConnections.current[remoteUserId].close();
        delete peerConnections.current[remoteUserId];
      }
    });

    socketRef.current.on("existingParticipants", async ({ participants }) => {
      console.log("Existing participants:", participants);
      
      // Update state with existing users
      setRemoteUserIds(prev => [...prev, ...participants]);
      
      // Create peer connections for each existing participant
      if (isVideoCallActive && localStreamRef.current) {
        for (const remoteUserId of participants) {
          const peerConnection = await createPeerConnection(remoteUserId);
          try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socketRef.current.emit("offer", { offer, to: remoteUserId });
          } catch (error) {
            console.error("Error creating offer for existing participant:", error);
          }
        }
      }
    });
    
    socketRef.current.on("offer", handleOffer);
    socketRef.current.on("answer", handleAnswer);
    socketRef.current.on("ice-candidate", handleICECandidate);

    return () => {
      socketRef.current.off("userJoined");
      socketRef.current.off("userLeft");
      socketRef.current.off("offer");
      socketRef.current.off("answer");
      socketRef.current.off("ice-candidate");
      socketRef.current.off("existingParticipants");
    };
  }, [isVideoCallActive]);

  useEffect(() => {
    // Initialize refs for remote videos
    remoteUserIds.forEach(id => {
      if (!remoteVideoRefs.current[id]) {
        remoteVideoRefs.current[id] = document.createElement('video');
        remoteVideoRefs.current[id].autoplay = true;
        remoteVideoRefs.current[id].playsInline = true;
      }
    });
  }, [remoteUserIds]);

  const handleUserJoined = async (remoteUserId) => {
    if (isVideoCallActive && localStreamRef.current) {
      const peerConnection = await createPeerConnection(remoteUserId);
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socketRef.current.emit("offer", { offer, to: remoteUserId });
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    }
  };

  const handleOffer = async ({ offer, from }) => {
    if (isVideoCallActive && localStreamRef.current) {
      const peerConnection = await createPeerConnection(from);
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socketRef.current.emit("answer", { answer, to: from });
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    }
  };

  const handleAnswer = async ({ answer, from }) => {
    try {
      if (peerConnections.current[from]) {
        await peerConnections.current[from].setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  const handleICECandidate = async ({ candidate, from }) => {
    try {
      if (peerConnections.current[from]) {
        await peerConnections.current[from].addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  };

  const createPeerConnection = async (remoteUserId) => {
    console.log("In create peer connection", remoteUserId, "and localStreamRef", localStreamRef.current);
    if (!localStreamRef.current) return null;

    if (peerConnections.current[remoteUserId]) {
      peerConnections.current[remoteUserId].close();
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    peerConnections.current[remoteUserId] = peerConnection;

    peerConnection.ontrack = (event) => {
      if (event.streams[0]) {
        setTimeout(() => {
          const remoteVideo = remoteVideoRefs.current[remoteUserId];
          if (remoteVideo && !remoteVideo.srcObject) {
            remoteVideo.srcObject = event.streams[0];
          }
        }, 100);
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", { 
          candidate: event.candidate, 
          to: remoteUserId 
        });
      }
    };

    localStreamRef.current.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStreamRef.current);
    });

    return peerConnection;
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = {
      team_id: teamId,
      sender: userId,
      content: message,
    };

    socketRef.current.emit("sendMessage", {
      team_id: teamId,
      message,
      sender: userId,
    });

    try {
      await fetch(`${NODE_BASE_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Add camera toggle functionality
  const toggleCamera = () => {
    if (!localStreamRef.current) return;

    const videoTracks = localStreamRef.current.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = !track.enabled;
    });

    setIsCameraEnabled(prev => !prev);
  };

  // Add microphone toggle functionality
  const toggleMic = () => {
    if (!localStreamRef.current) return;

    const audioTracks = localStreamRef.current.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = !track.enabled;
    });

    setIsMicEnabled(prev => !prev);
  };

  // Add functionality to check users in call
  const getUsersInCall = () => {
    return remoteUserIds.map(id => remoteUsers[id]?.name || id);
  };

  // Update the toggleScreenShare function to ensure the screen stream is sent to peers
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);

      // Revert to the camera stream
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });

        // Update the local video element
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    } else {
      try {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(stream);
        setIsScreenSharing(true);

        // Replace the video track with the screen track
        const screenTrack = stream.getVideoTracks()[0];
        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        // Update the local video element
        localVideoRef.current.srcObject = stream;

        // Handle screen share ending
        screenTrack.onended = () => {
          toggleScreenShare();
        };
      } catch (error) {
        console.error("Error sharing screen:", error);
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#030718] via-[#0A1428] to-[#0F2E6B] min-h-screen flex flex-col">
      {/* Header */}
      <div className="py-4 px-6 bg-[#030718]/90 backdrop-blur-lg shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Video className="h-6 w-6 text-white" />
            </div>
            <h1 className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">
              VideoPulse Chat
            </h1>
          </div>
          <div>
            {!isVideoCallActive ? (
              <button
                onClick={startVideoCall}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-green-500/30 transition-all duration-300 flex items-center"
              >
                <Phone className="w-4 h-4 mr-2" />
                Start Video Call
              </button>
            ) : (
              <button
                onClick={endVideoCall}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 flex items-center"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                End Call
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Video Call Area */}
      {isVideoCallActive && (
        <div className="bg-[#030718]/80 p-6 border-b border-blue-500/20">
          <div className="container mx-auto">
            <div className="flex gap-4 flex-wrap justify-center">
              {/* Local Video */}
              <div className="relative w-72 h-48 backdrop-blur-md bg-white/5 border border-blue-500/20 rounded-xl overflow-hidden hover:shadow-blue-500/20 hover:shadow-lg transition-all duration-300">
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <span className="text-white text-sm font-medium">
                    You {isScreenSharing ? '(Screen)' : ''}
                  </span>
                </div>
              </div>

              {/* Remote Videos */}
              {remoteUserIds.map(remoteUserId => (
                <div 
                  key={remoteUserId} 
                  className="relative w-72 h-48 backdrop-blur-md bg-white/5 border border-blue-500/20 rounded-xl overflow-hidden hover:shadow-blue-500/20 hover:shadow-lg transition-all duration-300"
                >
                  <video
                    ref={el => remoteVideoRefs.current[remoteUserId] = el}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <span className="text-white text-sm font-medium">
                      {remoteUserId}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Video Controls */}
            <div className="flex justify-center mt-4 space-x-3">
              <button
                onClick={toggleCamera}
                className={`p-3 rounded-full ${isCameraEnabled ? 'bg-blue-500/40' : 'bg-red-500/40'} hover:bg-blue-600/60 transition-colors`}
              >
                {isCameraEnabled ? (
                  <Camera className="h-5 w-5 text-white" />
                ) : (
                  <VideoOff className="h-5 w-5 text-white" />
                )}
              </button>
              <button
                onClick={toggleMic}
                className={`p-3 rounded-full ${isMicEnabled ? 'bg-blue-500/40' : 'bg-red-500/40'} hover:bg-blue-600/60 transition-colors`}
              >
                {isMicEnabled ? (
                  <Mic className="h-5 w-5 text-white" />
                ) : (
                  <MicOff className="h-5 w-5 text-white" />
                )}
              </button>
              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-full ${isScreenSharing ? 'bg-green-500/40' : 'bg-blue-500/40'} hover:bg-green-600/60 transition-colors`}
              >
                <Monitor className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 container mx-auto p-6 flex flex-col">
        {/* Messages Container */}
        <div className="flex-1 backdrop-blur-md bg-white/5 border border-blue-500/20 rounded-xl p-4 mb-4 overflow-y-auto max-h-[calc(100vh-300px)]">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-blue-100/50">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 max-w-[80%] ${msg.sender === userId ? 'ml-auto' : 'mr-auto'}`}
              >
                <div className={`p-3 rounded-xl shadow-md ${
                  msg.sender === userId
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    : 'backdrop-blur-md bg-white/10 text-blue-100'
                }`}>
                  <div className="font-medium text-xs mb-1 opacity-80">
                    {msg.userName || (msg.sender === userId ? 'You' : msg.sender)}
                  </div>
                  <div className="text-sm">{msg.content}</div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 backdrop-blur-md bg-white/5 border border-blue-500/20 rounded-l-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400"
          />
          <button
            onClick={sendMessage}
            className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-r-xl hover:opacity-90 transition-opacity"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;