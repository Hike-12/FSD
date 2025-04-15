import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { Camera, Mic, MicOff, Monitor, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { DJANGO_BASE_URL, NODE_BASE_URL } from "@/lib/utils";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenVideoSrc, setFullScreenVideoSrc] = useState(null);

  const handleVideoClick = (videoElement) => {
    if (videoElement) {
      if (videoElement.srcObject) {
        // Handle media streams (e.g., WebRTC)
        setFullScreenVideoSrc(videoElement.srcObject);
      } else {
        // Handle regular video files
        setFullScreenVideoSrc(videoElement.src);
      }
      setIsFullScreen(true);
    }
  };
  
  const closeFullScreen = () => {
    setIsFullScreen(false);
    setFullScreenVideoSrc(null);
  };
  
  useEffect(() => {
    console.log("Current userId:", userId);
    console.log("Messages state:", messages);
  }, [messages]);
  // Refs
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnections = useRef({});
  const remoteVideoRefs = useRef({});
  const remoteUsers = useRef({});

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // Scroll to bottom on new messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

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

      toast.success("Video call started successfully!");
    } catch (error) {
      console.error("Error starting video call:", error);
      toast.error("Could not access camera/microphone. Please check permissions.");
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
    toast.info("Video call ended");
  };

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    
    socketRef.current.emit("joinRoom", { team_id: teamId, user_id: userId });
    
    socketRef.current.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
      if (data.sender !== userId) {
        toast.info(`New message from ${data.userName || data.sender}`, { autoClose: 2000 });
      }
    });
    
    socketRef.current.on("error", (data) => {
      toast.error(data.message);
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
        console.log("Fetched messages:", data);
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
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
      toast.info(`${remoteUserId} joined the call`);
    });
    
    socketRef.current.on("userLeft", ({ userId: remoteUserId }) => {
      setRemoteUserIds(prev => prev.filter(id => id !== remoteUserId));
      if (peerConnections.current[remoteUserId]) {
        peerConnections.current[remoteUserId].close();
        delete peerConnections.current[remoteUserId];
      }
      toast.info(`${remoteUserId} left the call`);
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
            toast.error("Connection error");
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
        toast.error("Failed to connect with new participant");
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
        toast.error("Connection error");
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
      toast.error("Connection error");
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
      toast.error("Failed to send message");
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
    toast.info(videoTracks[0].enabled ? "Camera turned on" : "Camera turned off", { autoClose: 1500 });
  };

  // Add microphone toggle functionality
  const toggleMic = () => {
    if (!localStreamRef.current) return;

    const audioTracks = localStreamRef.current.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = !track.enabled;
    });

    setIsMicEnabled(prev => !prev);
    toast.info(audioTracks[0].enabled ? "Microphone unmuted" : "Microphone muted", { autoClose: 1500 });
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
        toast.info("Screen sharing stopped", { autoClose: 1500 });
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
        toast.success("Screen sharing started", { autoClose: 1500 });

        // Handle screen share ending
        screenTrack.onended = () => {
          toggleScreenShare();
        };
      } catch (error) {
        console.error("Error sharing screen:", error);
        toast.error("Failed to share screen");
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-[#030718] via-[#0A1428] to-[#0F2E6B] min-h-screen flex flex-col"
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="py-4 px-6 bg-[#030718]/90 backdrop-blur-lg shadow-lg"
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg"
            >
              <Video className="h-6 w-6 text-white" />
            </motion.div>
            <h1 className="ml-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100">
              VideoPulse Chat
            </h1>
          </div>
          <motion.div whileHover={{ scale: 1.05 }}>
            {!isVideoCallActive ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={startVideoCall}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-green-500/30 transition-all duration-300 flex items-center"
              >
                <Phone className="w-4 h-4 mr-2" />
                Start Video Call
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={endVideoCall}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg hover:shadow-red-500/30 transition-all duration-300 flex items-center"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                End Call
              </motion.button>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Video Call Area */}
      {isVideoCallActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#030718]/80 p-6 border-b border-blue-500/20"
        >
          <div className="container mx-auto">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex gap-4 flex-wrap justify-center"
            >
              {/* Local Video */}
              <motion.div
                variants={itemVariants}
                className="relative w-72 h-48 backdrop-blur-md bg-white/5 border border-blue-500/20 rounded-xl overflow-hidden hover:shadow-blue-500/20 hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)" }}
              >
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                  onClick={() => handleVideoClick(localVideoRef.current)} 
                />
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2"
                >
                  <span className="text-white text-sm font-medium">
                    You {isScreenSharing ? '(Screen)' : ''}
                  </span>
                </motion.div>
              </motion.div>

              {/* Remote Videos */}
              {remoteUserIds.map((remoteUserId, index) => (
                <motion.div 
                  key={remoteUserId}
                  variants={itemVariants}
                  className="relative w-72 h-48 backdrop-blur-md bg-white/5 border border-blue-500/20 rounded-xl overflow-hidden hover:shadow-blue-500/20 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)" }}
                >
                  <video
                    ref={el => remoteVideoRefs.current[remoteUserId] = el}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    onClick={() => handleVideoClick(remoteVideoRefs.current[remoteUserId])}
                  />
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2"
                  >
                    <span className="text-white text-sm font-medium">
                      {remoteUserId}
                    </span>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
            {isFullScreen && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
    {fullScreenVideoSrc instanceof MediaStream ? (
      <video
        ref={(el) => {
          if (el) el.srcObject = fullScreenVideoSrc;
        }}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain"
        controls
      />
    ) : (
      <video
        src={fullScreenVideoSrc}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain"
        controls
      />
    )}
    <button
      onClick={closeFullScreen}
      className="absolute top-4 right-4 text-white bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
    >
      Close
    </button>
  </div>
)}
            {/* Video Controls */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mt-4 space-x-3"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleCamera}
                className={`p-3 rounded-full ${isCameraEnabled ? 'bg-blue-500/40' : 'bg-red-500/40'} hover:bg-blue-600/60 transition-colors`}
              >
                {isCameraEnabled ? (
                  <Camera className="h-5 w-5 text-white" />
                ) : (
                  <VideoOff className="h-5 w-5 text-white" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMic}
                className={`p-3 rounded-full ${isMicEnabled ? 'bg-blue-500/40' : 'bg-red-500/40'} hover:bg-blue-600/60 transition-colors`}
              >
                {isMicEnabled ? (
                  <Mic className="h-5 w-5 text-white" />
                ) : (
                  <MicOff className="h-5 w-5 text-white" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleScreenShare}
                className={`p-3 rounded-full ${isScreenSharing ? 'bg-green-500/40' : 'bg-blue-500/40'} hover:bg-green-600/60 transition-colors`}
              >
                <Monitor className="h-5 w-5 text-white" />
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}

      <div className="flex-1 container mx-auto p-6 flex flex-col">
      {/* Messages Container */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 backdrop-blur-md bg-white/5 border border-blue-500/20 rounded-xl p-4 mb-4 overflow-y-auto max-h-[calc(100vh-300px)]"
      >
  {messages.length === 0 ? (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="h-full flex items-center justify-center text-blue-100/50"
    >
      No messages yet. Start the conversation!
    </motion.div>
  ) : (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col space-y-4"
    >
      {messages.map((msg, index) => (
        <motion.div
          key={msg._id || index}
          variants={itemVariants}
          custom={index}
          className={`flex ${msg.sender === userId ? 'justify-end' : 'justify-start'}`}
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`max-w-[85%] p-3 rounded-xl shadow-md ${
              msg.sender === userId
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                : 'backdrop-blur-md bg-white/10 text-blue-100'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-xs opacity-80">
                {msg.userName || (msg.sender === userId ? 'You' : msg.sender)}
              </span>
              {msg.timestamp && (
                <span className="text-xs opacity-60 ml-2">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              )}
            </div>
            <div className="text-sm break-words">{msg.content}</div>
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  )}
  <div ref={messagesEndRef} />
</motion.div>

        {/* Message Input */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex"
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 backdrop-blur-md bg-white/5 border border-blue-500/20 rounded-l-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-r-xl hover:opacity-90 transition-opacity"
          >
            Send
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Chat;