// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { io } from "socket.io-client";
// import { env } from "echarts";

// // Use environment variables or a configuration file for production
// const API_URL = "http://localhost:5000";
// const SOCKET_URL =  "http://localhost:5000";

// const Chat = () => {
//     const [messages, setMessages] = useState([]);
//     const [message, setMessage] = useState("");
//     const [roomId, setRoomId] = useState("test-room");
//     const [inCall, setInCall] = useState(false);
//     const [connected, setConnected] = useState(false);
//     const [serverStatus, setServerStatus] = useState("Connecting...");
//     const [error, setError] = useState("");
    
//     const socketRef = useRef(null);
//     const localVideoRef = useRef(null);
//     const remoteVideoRef = useRef(null);
//     const peerConnection = useRef(null);
//     const localStreamRef = useRef(null);

//     // Initialize socket connection
//     useEffect(() => {
//         // Create socket connection
//         socketRef.current = io(SOCKET_URL, {
//             reconnectionAttempts: 5,
//             reconnectionDelay: 1000,
//             transports: ['websocket', 'polling']
//         });
        
//         // Connection events
//         socketRef.current.on("connect", () => {
//             console.log("Socket connected!");
//             setConnected(true);
//             setServerStatus("Connected to server");
//         });
        
//         socketRef.current.on("connect_error", (err) => {
//             console.error("Connection error:", err);
//             setError(`Connection error: ${err.message}`);
//             setServerStatus("Connection failed");
//         });
        
//         socketRef.current.on("welcome", (data) => {
//             console.log("Server welcome:", data);
//         });
        
//         // Clean up on unmount
//         return () => {
//             if (localStreamRef.current) {
//                 localStreamRef.current.getTracks().forEach(track => track.stop());
//             }
//             if (peerConnection.current) {
//                 peerConnection.current.close();
//             }
//             if (socketRef.current) {
//                 socketRef.current.disconnect();
//             }
//         };
//     }, []);

//     // Set up message handling
//     useEffect(() => {
//         if (!socketRef.current) return;
        
//         // Test server connectivity
//         axios.get(`${API_URL}/debug`)
//             .then(res => {
//                 console.log("Server debug info:", res.data);
//                 setServerStatus(`Server connected (${res.data.socketConnections} active connections)`);
//             })
//             .catch(err => {
//                 console.error("Server connectivity test failed:", err);
//                 setError(`Server test failed: ${err.message}`);
//             });
            
//         // Fetch initial messages
//         axios.get(`${API_URL}/messages`)
//             .then(res => {
//                 console.log("Messages loaded:", res.data.length);
//                 setMessages(res.data);
//             })
//             .catch(err => {
//                 console.error("Error fetching messages:", err);
//                 setError(`Failed to fetch messages: ${err.message}`);
//             });

//         // Socket event handlers
//         socketRef.current.on("newMessage", (newMsg) => {
//             console.log("New message received:", newMsg);
//             setMessages((prev) => [newMsg, ...prev]);
//         });

//         socketRef.current.on("userJoined", ({ userId }) => {
//             console.log(`User joined call: ${userId}`);
//         });

//         socketRef.current.on("offer", async ({ offer, from }) => {
//             console.log(`Received offer from: ${from}`);
//             try {
//                 if (!peerConnection.current) {
//                     await setupPeerConnection();
//                 }
                
//                 await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
//                 const answer = await peerConnection.current.createAnswer();
//                 await peerConnection.current.setLocalDescription(answer);
                
//                 socketRef.current.emit("answer", { answer, roomId });
//             } catch (err) {
//                 console.error("Error handling offer:", err);
//                 setError(`WebRTC offer error: ${err.message}`);
//             }
//         });

//         socketRef.current.on("answer", async ({ answer }) => {
//             console.log("Received answer");
//             try {
//                 await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
//             } catch (err) {
//                 console.error("Error handling answer:", err);
//                 setError(`WebRTC answer error: ${err.message}`);
//             }
//         });

//         socketRef.current.on("ice-candidate", async ({ candidate }) => {
//             console.log("Received ICE candidate");
//             try {
//                 if (peerConnection.current) {
//                     await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//                 }
//             } catch (err) {
//                 console.error("Error adding ICE candidate:", err);
//             }
//         });
//     }, [roomId]);

//     const sendMessage = async () => {
//         if (!message.trim()) return;
        
//         try {
//             await axios.post(`${API_URL}/messages`, { 
//                 sender: "User", 
//                 content: message 
//             });
//             setMessage("");
//         } catch (err) {
//             console.error("Error sending message:", err);
//             setError(`Failed to send message: ${err.message}`);
//         }
//     };

//     const setupPeerConnection = async () => {
//         try {
//             peerConnection.current = new RTCPeerConnection({
//                 iceServers: [
//                     { urls: "stun:stun.l.google.com:19302" },
//                     { urls: "stun:stun1.l.google.com:19302" }
//                 ]
//             });

//             peerConnection.current.ontrack = (event) => {
//                 console.log("Received remote track");
//                 if (remoteVideoRef.current && event.streams && event.streams[0]) {
//                     remoteVideoRef.current.srcObject = event.streams[0];
//                 }
//             };

//             peerConnection.current.onicecandidate = (event) => {
//                 if (event.candidate) {
//                     console.log("Sending ICE candidate");
//                     socketRef.current.emit("ice-candidate", { 
//                         candidate: event.candidate, 
//                         roomId 
//                     });
//                 }
//             };
            
//             peerConnection.current.oniceconnectionstatechange = () => {
//                 console.log("ICE connection state:", peerConnection.current.iceConnectionState);
//             };

//             // Get local media stream if not already acquired
//             if (!localStreamRef.current) {
//                 localStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
//                     video: true, 
//                     audio: true 
//                 });
                
//                 if (localVideoRef.current) {
//                     localVideoRef.current.srcObject = localStreamRef.current;
//                 }
//             }

//             // Add tracks to the peer connection
//             localStreamRef.current.getTracks().forEach(track => {
//                 peerConnection.current.addTrack(track, localStreamRef.current);
//             });
            
//         } catch (err) {
//             console.error("Error setting up peer connection:", err);
//             setError(`WebRTC setup error: ${err.message}`);
//             throw err;
//         }
//     };

//     const startCall = async () => {
//         try {
//             setInCall(true);
//             socketRef.current.emit("joinCall", roomId);
            
//             await setupPeerConnection();
            
//             const offer = await peerConnection.current.createOffer();
//             await peerConnection.current.setLocalDescription(offer);
            
//             socketRef.current.emit("offer", { offer, roomId });
            
//         } catch (err) {
//             console.error("Error starting call:", err);
//             setError(`Failed to start call: ${err.message}`);
//             setInCall(false);
//         }
//     };

//     return (
//         <div className="container mx-auto p-4">
//             <h2 className="text-2xl font-bold mb-4">Real-Time Chat & Video</h2>
            
//             {/* Status information */}
//             <div className="mb-4 p-2 border rounded">
//                 <p><strong>Server status:</strong> {serverStatus}</p>
//                 <p><strong>Room ID:</strong> {roomId}</p>
//                 <input 
//                     value={roomId} 
//                     onChange={(e) => setRoomId(e.target.value)}
//                     className="border p-1 mt-1"
//                     placeholder="Enter room ID"
//                 />
//                 {error && <p className="text-red-500 mt-2">{error}</p>}
//             </div>

//             {/* Chat section */}
//             <div className="mb-6">
//                 <div className="flex mb-2">
//                     <input 
//                         value={message} 
//                         onChange={(e) => setMessage(e.target.value)}
//                         onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
//                         className="flex-grow border p-2 mr-2"
//                         placeholder="Type a message..."
//                     />
//                     <button 
//                         onClick={sendMessage}
//                         className="bg-blue-500 text-white px-4 py-2 rounded"
//                         disabled={!connected}
//                     >
//                         Send
//                     </button>
//                 </div>
                
//                 <div className="border p-4 h-64 overflow-y-auto">
//                     {messages.length > 0 ? (
//                         messages.map((msg, index) => (
//                             <p key={index} className="mb-2">
//                                 <strong>{msg.sender}:</strong> {msg.content}
//                             </p>
//                         ))
//                     ) : (
//                         <p className="text-gray-500">No messages yet</p>
//                     )}
//                 </div>
//             </div>

//             {/* Video call section */}
//             <div>
//                 <button 
//                     onClick={startCall} 
//                     disabled={inCall || !connected}
//                     className={`mb-4 px-4 py-2 rounded ${inCall ? 'bg-gray-400' : 'bg-green-500 text-white'}`}
//                 >
//                     {inCall ? "In Call" : "Start Video Call"}
//                 </button>
                
//                 <div className="flex flex-wrap gap-4">
//                     <div className="border p-2">
//                         <p className="mb-2">Local Video</p>
//                         <video 
//                             ref={localVideoRef} 
//                             autoPlay 
//                             playsInline 
//                             muted
//                             className="bg-black h-48 w-64" 
//                         />
//                     </div>
                    
//                     <div className="border p-2">
//                         <p className="mb-2">Remote Video</p>
//                         <video 
//                             ref={remoteVideoRef} 
//                             autoPlay 
//                             playsInline
//                             className="bg-black h-48 w-64" 
//                         />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Chat;


import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const API_URL = "http://localhost:5000" 
const SOCKET_URL = API_URL;

const Chat = () => {
    const { teamId } = useParams();
    const userId = localStorage.getItem("userId");
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [isVideoCallActive, setIsVideoCallActive] = useState(false);
    const [remoteUserIds, setRemoteUserIds] = useState([]);

    // Refs
    const socketRef = useRef(null);
    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const peerConnections = useRef({});
    const remoteVideoRefs = useRef({});

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
                const response = await fetch(`${API_URL}/messages?team_id=${teamId}`);
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
        
        socketRef.current.on("offer", handleOffer);
        socketRef.current.on("answer", handleAnswer);
        socketRef.current.on("ice-candidate", handleICECandidate);

        return () => {
            socketRef.current.off("userJoined");
            socketRef.current.off("userLeft");
            socketRef.current.off("offer");
            socketRef.current.off("answer");
            socketRef.current.off("ice-candidate");
        };
    }, [isVideoCallActive]);

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
            await fetch(`${API_URL}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newMessage),
            });
            setMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const startVideoCall = async () => {
        try {
            console.log("Starting video call...");
    
            // Initialize local media stream
            if (!localStreamRef.current) {
                localStreamRef.current = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
            }
    
            // Assign the local stream to the local video element
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current;
            }
    
            console.log("Local Stream Ref:", localStreamRef.current);
    
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;