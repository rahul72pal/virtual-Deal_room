import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/redux/slices/authSlice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DealsPage from "./DealsPage"; // Seller deals
import AllMessagesPage from "./AllMessagesPage"; // Messages
import BuyerDealsPage from "./BuyerDealsPage"; // Active deals for buyer
import CompleteDealsPage from "./CompleteDealsPage"; // Completed deals

export default function Dashboard() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const role = useSelector((state) => state.auth.user?.role);

    const handleLogout = () => {
        localStorage.removeItem("token");
        dispatch(logoutUser());
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Virtual Deal Room ({role})</h1>
                <Button onClick={handleLogout} variant="destructive">
                    Logout
                </Button>
            </div>

            <Tabs defaultValue="deals" className="w-full">
                {/* Tabs List */}
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="deals">Deals</TabsTrigger>
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                    <TabsTrigger value="completed">
                        {role === "buyer" ? "Completed Deals" : "My Completed Sales"}
                    </TabsTrigger>
                </TabsList>

                {/* Deals Tab */}
                <TabsContent value="deals" className="mt-4">
                    {role === "seller" ? <DealsPage /> : <BuyerDealsPage />}
                </TabsContent>

                {/* Messages Tab */}
                <TabsContent value="messages" className="mt-4">
                    <AllMessagesPage />
                </TabsContent>

                {/* Completed Deals Tab (for both buyer and seller) */}
                <TabsContent value="completed" className="mt-4">
                    <CompleteDealsPage />
                </TabsContent>
            </Tabs>
        </div>
    );
}
