import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { io } from "socket.io-client";
import axios from "axios";
import toast from "react-hot-toast";
import { apiRequest } from "@/utils/api";

const MessagesPage = () => {
    const { dealId } = useParams();
    const token = useSelector((state) => state.auth.token);
    const userId = useSelector((state) => state.auth.user?.id);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    console.log("import.meta.env.REACT_APP_API_URL =", import.meta.env.VITE_API_URL);

    // Connect to socket and fetch initial messages
    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io("http://localhost:5000" , {
            auth: { token }
        });

        // Join the deal room
        socketRef.current.emit("joinRoom", dealId);

        // Listen for new messages
        socketRef.current.on("receiveMessage", (newMessage) => {
            setMessages(prev => [...prev, newMessage]);
        });

        // Fetch initial messages
        const fetchMessages = async () => {
            try {
                const res = await apiRequest("GET", `/messages/${dealId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessages(res);
            } catch (error) {
                toast.error(error.message || "Error fetching messages");
            }
        };

        fetchMessages();

        return () => {
            // Clean up socket connection
            if (socketRef.current) {
                socketRef.current.off("receiveMessage");
                socketRef.current.disconnect();
            }
        };
    }, [dealId, token]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle message sending
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        try {
            const res = await apiRequest(
                "POST",
                `/messages/${dealId}`,
                { content: message },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Error sending message");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6">
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">Messages</h2>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                        {messages?.map((msg) => (
                            <div
                                key={msg._id}
                                className={`p-3 rounded-lg max-w-xs ${
                                    msg.sender._id === userId 
                                        ? "bg-blue-500 text-white ml-auto" 
                                        : "bg-gray-200 text-black mr-auto"
                                }`}
                            >
                                <p className="font-medium">
                                    {msg.sender._id === userId ? "You" : msg.sender.name}
                                </p>
                                <p>{msg.content}</p>
                                <small className="text-xs opacity-70 block mt-1">
                                    {new Date(msg.createdAt).toLocaleString()}
                                </small>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                        <Input
                            type="text"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? "Sending..." : "Send"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default MessagesPage;