import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://127.0.0.1:5000"); // Chat Server URL

function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    useEffect(() => {
        // Receive chat history
        socket.on("chatHistory", (history) => {
            setMessages(history);
        });

        // Receive new messages
        socket.on("receiveMessage", (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => {
            socket.off("chatHistory");
            socket.off("receiveMessage");
        };
    }, []);

    const sendMessage = () => {
        if (input.trim()) {
            socket.emit("sendMessage", { sender: "User", content: input });
            setInput("");
        }
    };

    return (
        <div>
            <h2>Real-Time Chat</h2>
            <div>
                {messages.map((msg, index) => (
                    <p key={index}><strong>{msg.sender}:</strong> {msg.content}</p>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

export default Chat;
