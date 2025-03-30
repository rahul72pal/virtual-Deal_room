import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/redux/slices/authSlice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DealsPage from "./DealsPage"; // Import your existing deals component
import AllMessagesPage from "./AllMessagesPage"; // Import your existing messages component
import BuyerDealsPage from "./BuyerDealsPage";

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
                <h1 className="text-2xl font-bold">Virtual Deal Room</h1>
                <Button onClick={handleLogout} variant="destructive">
                    Logout
                </Button>
            </div>

            <Tabs defaultValue="deals" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="deals">Deals</TabsTrigger>
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                </TabsList>

                <TabsContent value="deals" className="mt-4">
                    {role === "seller" ? (
                        <DealsPage />
                    ) : (
                        <BuyerDealsPage /> // Assuming you have this component
                    )}
                </TabsContent>

                <TabsContent value="messages" className="mt-4">
                    <AllMessagesPage />
                </TabsContent>
            </Tabs>
        </div>
    );
}