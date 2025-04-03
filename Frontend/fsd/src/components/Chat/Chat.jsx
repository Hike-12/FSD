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

const SOCKET_URL = "http://localhost:5000";
const API_URL = "http://localhost:5000";

const Chat = () => {
    const { teamId } = useParams(); // Extract teamId from the URL
    const userId = localStorage.getItem("userId"); // Retrieve userId from localStorage or session
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const socketRef = useRef(null);

    // Initialize socket connection
    useEffect(() => {
        socketRef.current = io(SOCKET_URL);
    
        // Join the chat room
        socketRef.current.emit("joinRoom", { team_id: teamId, user_id: userId });
    
        // Listen for real-time messages
        socketRef.current.on("receiveMessage", (data) => {
            setMessages((prev) => [...prev, data]);
        });
    
        // Handle errors
        socketRef.current.on("error", (data) => {
            alert(data.message);
        });
    
        return () => {
            socketRef.current.disconnect();
        };
    }, [teamId, userId]);
    // Fetch initial messages when the component mounts
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await fetch(`${API_URL}/messages?team_id=${teamId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch messages");
                }
                const data = await response.json();
                setMessages(data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
    
        fetchMessages();
    }, [teamId]);


    // Send a message to the backend
    const sendMessage = async () => {
        if (!message.trim()) return;
    
        const newMessage = {
            team_id: teamId,
            sender: userId,
            content: message,
        };
    
        console.log("Sending message:", newMessage);
    
        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newMessage),
            });
    
            if (!response.ok) {
                throw new Error("Failed to send message");
            }
    
            setMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const startVideoCall = () => {
        setIsVideoCallActive(true);
    };

    const endVideoCall = () => {
        setIsVideoCallActive(false);
    };

    return (
        <div>
            <h2>Chat Room</h2>
            <div>
                {messages.map((msg, index) => (
                    <p key={index}>
                        <strong>{msg.userName}:</strong> {msg.content}
                    </p>
                ))}
            </div>
            <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default Chat;