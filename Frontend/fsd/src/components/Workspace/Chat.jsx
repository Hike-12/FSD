import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import {DJANGO_BASE_URL} from "@/lib/utils";
import {NODE_BASE_URL} from "@/lib/utils";

const SOCKET_URL = window.location.hostname === "localhost" ? "http://localhost:5000":   "http://192.168.0.110:5000/";
const Chat = () => {
    const { teamId } = useParams();
    const userId = localStorage.getItem("userId");
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [isVideoCallActive, setIsVideoCallActive] = useState(false);
    const [remoteUserIds, setRemoteUserIds] = useState([]);
    const [isCameraEnabled, setIsCameraEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [screenStream, setScreenStream] = useState(null);
    const [isMicEnabled, setIsMicEnabled] = useState(true);

    // Refs
    const socketRef = useRef(null);
    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const peerConnections = useRef({});
    const remoteVideoRefs = useRef({});
    const remoteUsers = useRef({});

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
        console.log("In create peer connection", remoteUserId ,"and localStreamRef", localStreamRef.current);
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
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Video Call Section */}
            {isVideoCallActive && (
                <div className="p-4 bg-gray-800">
                    <div className="flex gap-4 flex-wrap">
                        {/* Local Video */}
                        <div className="relative w-64 h-48 bg-gray-700 rounded-lg overflow-hidden">
                            <video 
                            ref={localVideoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-cover" 
                            />
                            <span className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                            You
                            </span>
                        </div>

                        {/* Remote Videos */}
                        {remoteUserIds.map(remoteUserId => (
                            <div key={remoteUserId} className="relative w-64 h-48 bg-gray-700 rounded-lg overflow-hidden">
                                <video
                                    ref={el => remoteVideoRefs.current[remoteUserId] = el}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                                    {remoteUserId}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat Section */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
                <div className="flex-1 bg-white rounded-lg shadow-lg overflow-y-auto p-4 mb-4">
                    {messages.map((msg, index) => (
                        <div 
                            key={index}
                            className={`mb-3 p-3 rounded-lg max-w-[70%] ${
                                msg.sender === userId 
                                    ? "bg-blue-500 text-white ml-auto"
                                    : "bg-gray-200 mr-auto"
                            }`}
                        >
                            <div className="font-semibold text-sm mb-1">
                                {msg.userName || msg.sender}
                            </div>
                            <div className="text-sm">{msg.content}</div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="flex gap-2">
                    <input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={sendMessage}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Send
                    </button>
                    
                    {/* Video Call Controls */}
                    {!isVideoCallActive ? (
                        <button
                            onClick={startVideoCall}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Start Call
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={endVideoCall}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                End Call
                            </button>
                            <button
                                onClick={toggleCamera}
                                className={`px-4 py-2 ${isCameraEnabled ? 'bg-blue-500' : 'bg-red-500'} text-white rounded-lg hover:bg-blue-600 transition-colors`}
                            >
                                {isCameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
                            </button>
                            <button
                                onClick={toggleScreenShare}
                                className={`px-4 py-2 ${isScreenSharing ? 'bg-green-500' : 'bg-blue-500'} text-white rounded-lg hover:bg-green-600 transition-colors`}
                            >
                                {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                            </button>
                            <button
                                onClick={toggleMic}
                                className={`px-4 py-2 ${isMicEnabled ? 'bg-blue-500' : 'bg-red-500'} text-white rounded-lg hover:bg-blue-600 transition-colors`}
                            >
                                {isMicEnabled ? 'Mute Mic' : 'Unmute Mic'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;