import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";
import { apiRequest } from "@/utils/api";

const AllMessagesPage = () => {
    const token = useSelector((state) => state.auth.token);
    const user = useSelector((state)=> state.auth.user);
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await apiRequest("GET", "messages/deals-with-messages");
                setConversations(res); // Assuming res contains the conversation list
            } catch (error) {
                toast.error(error.message || "Error fetching messages");
            }
        };

        fetchConversations();
    }, [token]);

    return (
        <div className="max-w-3xl mx-auto mt-10 p-6">
            <h2 className="text-2xl font-semibold mb-4"> <span className="text-blue-600 font-bold">{user.role ==="seller"? "Seller": "Buyer"}</span>All Messages</h2>
            <div className="space-y-4">
                {conversations.length === 0 ? (
                    <p className="text-gray-500">No messages yet.</p>
                ) : (
                    conversations.map((conv) => (
                        <Card key={conv.dealId}>
                            <CardHeader>
                                <h3 className="text-lg font-semibold">{conv.dealTitle}</h3>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    Last Message: {conv.latestMessage?.text || "No messages yet"}
                                </p>
                                {user.role !== "buyer"&&<p className="text-sm text-gray-500">
                                    Buyer: {conv.buyerName} (ID: {conv.buyerId})
                                </p>}
                                <Link
                                    to={`/messages/${conv.dealId}`}
                                    className="text-blue-500 hover:underline mt-2 block"
                                >
                                    View Chat
                                </Link>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default AllMessagesPage;
