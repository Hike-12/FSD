import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import styled, { keyframes } from 'styled-components';
import { Mic, Video, Phone, Smile, Paperclip, Send, MoreVertical } from 'lucide-react';

// Socket connection
const socket = io("http://127.0.0.1:5000");

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const ChatContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #121212;
  color: white;
  font-family: 'Inter', sans-serif;
`;

const Sidebar = styled.div`
  width: 300px;
  background: #1F2A2A;
  border-right: 1px solid #2A3A3A;
  padding: 1.5rem;
  overflow-y: auto;
`;

const ChatMain = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled.div`
  padding: 1.5rem;
  background: #1F2A2A;
  border-bottom: 1px solid #2A3A3A;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  background: #121212;
`;

const Message = styled.div`
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 0.3s ease-out;
  max-width: 70%;
  align-self: ${props => props.isCurrentUser ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background: ${props => props.isCurrentUser ? 
    'linear-gradient(to right, #00C4B8, #006D66)' : 
    '#1F2A2A'};
  color: white;
  display: inline-block;
  position: relative;
  border: ${props => !props.isCurrentUser && '1px solid #2A3A3A'};
`;

const MessageSender = styled.span`
  font-weight: bold;
  color: ${props => props.isCurrentUser ? '#E2E8F0' : '#00C4B8'};
  margin-bottom: 0.25rem;
  display: block;
`;

const MessageTime = styled.span`
  font-size: 0.75rem;
  color: ${props => props.isCurrentUser ? 'rgba(255,255,255,0.7)' : '#A0AEC0'};
  margin-top: 0.5rem;
  display: block;
  text-align: ${props => props.isCurrentUser ? 'right' : 'left'};
`;

const ChatInputContainer = styled.div`
  padding: 1rem;
  background: #1F2A2A;
  border-top: 1px solid #2A3A3A;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  background: #121212;
  border: 1px solid #2A3A3A;
  border-radius: 1.5rem;
  color: white;
  font-size: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #00C4B8;
    box-shadow: 0 0 0 2px rgba(0, 196, 184, 0.3);
  }

  &::placeholder {
    color: #A0AEC0;
  }
`;

const SendButton = styled.button`
  padding: 0.75rem;
  background: linear-gradient(to right, #00C4B8, #006D66);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 196, 184, 0.3);
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  background: transparent;
  color: #A0AEC0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    color: #00C4B8;
    background: rgba(0, 196, 184, 0.1);
  }
`;

const UserItem = styled.div`
  padding: 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 0.5rem;

  &:hover {
    background: rgba(0, 196, 184, 0.1);
  }

  &.active {
    background: rgba(0, 196, 184, 0.2);
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color || '#00C4B8'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => props.isOnline ? '#00C4B8' : '#A0AEC0'};
    border: 2px solid #1F2A2A;
  }
`;

const VideoCallContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #121212;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 2rem;
`;

const VideoGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const VideoBox = styled.div`
  background: #1F2A2A;
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
  border: 1px solid #2A3A3A;
`;

const VideoLabel = styled.div`
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
`;

const CallControls = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const CallButton = styled.button`
  padding: 0.75rem;
  border-radius: 50%;
  background: ${props => props.endCall ? '#ff6b6b' : '#1F2A2A'};
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
  }
`;

function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [currentUser] = useState("You");
    const [users, setUsers] = useState([
        { id: 1, name: "John Doe", online: true, color: "#3B82F6" },
        { id: 2, name: "Jane Smith", online: true, color: "#EC4899" },
        { id: 3, name: "Mike Johnson", online: false, color: "#F59E0B" },
    ]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isVideoCallActive, setIsVideoCallActive] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Receive chat history
        socket.on("chatHistory", (history) => {
            setMessages(history);
        });

        // Receive new messages
        socket.on("receiveMessage", (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Simulate receiving messages from other users
        const interval = setInterval(() => {
            if (Math.random() > 0.7 && messages.length > 0) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                if (randomUser && randomUser.name !== currentUser) {
                    const sampleMessages = [
                        "Hey there!",
                        "How are you doing?",
                        "Let's meet tomorrow",
                        "Did you see the latest update?",
                        "I'll call you later"
                    ];
                    const newMessage = {
                        sender: randomUser.name,
                        content: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    setMessages(prev => [...prev, newMessage]);
                }
            }
        }, 10000);

        return () => {
            socket.off("chatHistory");
            socket.off("receiveMessage");
            clearInterval(interval);
        };
    }, [messages.length, users, currentUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sendMessage = () => {
        if (input.trim()) {
            const message = {
                sender: currentUser,
                content: input,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            socket.emit("sendMessage", message);
            setMessages((prevMessages) => [...prevMessages, message]);
            setInput("");
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
        <>
            {isVideoCallActive ? (
                <VideoCallContainer>
                    <h2 style={{ marginBottom: '1rem', color: 'white' }}>Video Call with {selectedUser?.name}</h2>
                    <VideoGrid>
                        <VideoBox>
                            <video style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay muted />
                            <VideoLabel>You</VideoLabel>
                        </VideoBox>
                        <VideoBox>
                            <video style={{ width: '100%', height: '100%', objectFit: 'cover' }} autoPlay />
                            <VideoLabel>{selectedUser?.name}</VideoLabel>
                        </VideoBox>
                    </VideoGrid>
                    <CallControls>
                        <CallButton>
                            <Mic size={20} />
                        </CallButton>
                        <CallButton>
                            <Video size={20} />
                        </CallButton>
                        <CallButton endCall onClick={endVideoCall}>
                            <Phone size={20} />
                        </CallButton>
                    </CallControls>
                </VideoCallContainer>
            ) : (
                <ChatContainer>
                    <Sidebar>
                        <h3 style={{ marginBottom: '1rem', color: 'white' }}>Contacts</h3>
                        {users.map(user => (
                            <UserItem 
                                key={user.id} 
                                className={selectedUser?.id === user.id ? 'active' : ''}
                                onClick={() => setSelectedUser(user)}
                            >
                                <UserAvatar color={user.color} isOnline={user.online}>
                                    {user.name.charAt(0)}
                                </UserAvatar>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: 'white' }}>{user.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#A0AEC0' }}>
                                        {user.online ? 'Online' : 'Offline'}
                                    </div>
                                </div>
                            </UserItem>
                        ))}
                    </Sidebar>
                    
                    <ChatMain>
                        {selectedUser ? (
                            <>
                                <ChatHeader>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <UserAvatar color={selectedUser.color} isOnline={selectedUser.online}>
                                            {selectedUser.name.charAt(0)}
                                        </UserAvatar>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: 'white' }}>{selectedUser.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#00C4B8' }}>
                                                {selectedUser.online ? 'Online' : 'Offline'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <ActionButton onClick={startVideoCall}>
                                            <Video size={20} />
                                        </ActionButton>
                                        <ActionButton>
                                            <Phone size={20} />
                                        </ActionButton>
                                        <ActionButton>
                                            <MoreVertical size={20} />
                                        </ActionButton>
                                    </div>
                                </ChatHeader>
                                
                                <ChatMessages>
                                    {messages.map((msg, index) => (
                                        <Message 
                                            key={index} 
                                            isCurrentUser={msg.sender === currentUser}
                                        >
                                            <MessageSender isCurrentUser={msg.sender === currentUser}>
                                                {msg.sender === currentUser ? 'You' : msg.sender}
                                            </MessageSender>
                                            <MessageBubble isCurrentUser={msg.sender === currentUser}>
                                                {msg.content}
                                            </MessageBubble>
                                            <MessageTime isCurrentUser={msg.sender === currentUser}>
                                                {msg.timestamp || 'Just now'}
                                            </MessageTime>
                                        </Message>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </ChatMessages>
                                
                                <ChatInputContainer>
                                    <ActionButton>
                                        <Paperclip size={20} />
                                    </ActionButton>
                                    <ActionButton>
                                        <Smile size={20} />
                                    </ActionButton>
                                    <ChatInput
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type a message..."
                                    />
                                    <SendButton onClick={sendMessage}>
                                        <Send size={20} />
                                    </SendButton>
                                </ChatInputContainer>
                            </>
                        ) : (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                color: '#A0AEC0'
                            }}>
                                Select a user to start chatting
                            </div>
                        )}
                    </ChatMain>
                </ChatContainer>
            )}
        </>
    );
}

export default Chat;