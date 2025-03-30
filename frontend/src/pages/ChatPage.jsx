import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000"); // Connect to backend server

const ChatPage = () => {
    const { id: dealId } = useParams(); // Get deal ID from URL params
    const user = useSelector((state) => state.auth.user); // Get user info from Redux
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const chatEndRef = useRef(null);

    useEffect(() => {
        socket.emit("joinRoom", dealId);

        // Fetch chat history
        axios.get(`http://localhost:5000/api/messages/${dealId}`)
            .then((res) => setMessages(res.data))
            .catch((err) => console.error("Error fetching messages:", err));

        // Listen for new messages
        socket.on("receiveMessage", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, [dealId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const addMessage = async () => {
        if (!newMessage.trim()) return;
    
        const messageData = {
            roomId: dealId,
            senderId: user?.id,
            reciverId: "SELLER_OR_BUYER_ID", // Replace with actual recipient ID
            content: newMessage,
        };
    
        try {
            // Send message to backend for database storage
            const { data } = await axios.post(`http://localhost:5000/api/messages/${dealId}`, { content: newMessage }, {
                headers: { Authorization: `Bearer ${user.token}` }, // Ensure authorization
            });
    
            // Emit message via Socket.io for real-time update
            socket.emit("sendMessage", messageData);
    
            // Update local state
            setMessages((prev) => [...prev, data.messageData]);
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error.response?.data?.message || error.message);
        }
    };
    

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6">
            <h2 className="text-2xl font-semibold mb-4">Chat for Deal #{dealId}</h2>
            <Card className="h-96 overflow-y-auto p-4">
                <CardContent>
                    {messages.map((msg) => (
                        <div key={msg._id} className={`mb-3 flex ${msg.sender._id === user?.id ? "justify-end" : "justify-start"}`}>
                            <div className={`p-3 rounded-lg ${msg.sender._id === user?.id ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className="text-xs text-gray-500 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </CardContent>
            </Card>

            <div className="mt-4 flex items-center">
                <Input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 mr-2"
                />
                <Button onClick={addMessage}>Send</Button>
            </div>
        </div>
    );
};

export default ChatPage;
