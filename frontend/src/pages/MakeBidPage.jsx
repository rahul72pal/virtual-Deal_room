import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { apiRequest } from "@/utils/api";

const MakeBidPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
    const role = useSelector((state) => state.auth.user?.role);
    const [deal, setDeal] = useState(null);
    const [offeredPrice, setOfferedPrice] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
        if (role !== "buyer") {
            toast.error("Only buyers can place bids.");
            navigate("/dashboard");
        }

        const fetchDeal = async () => {
            try {
                const res = await apiRequest("GET", `/deals/${id}/dealDetails`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDeal(res); // Assuming setDeal is a state setter function from useState
            } catch (error) {
                console.log(error);
                toast.error(error.response?.data?.message || "Error fetching deal");
            }
        };

        fetchDeal();
    }, [id, token, role, navigate]);

    const handleBidSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            const res = await apiRequest("POST", `bid/${id}/bid`, { offeredPrice });
    
            toast.success(res.message); // Assuming `apiRequest` returns `{ message: "..."}`
            navigate("/deals"); // Redirect after bid placement
        } catch (error) {
            toast.error(error.message || "Error placing bid");
        } finally {
            setLoading(false);
        }
    };    

    if (!deal) return <p>Loading deal details...</p>;

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6">
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-semibold">{deal.title}</h2>
                    <p className="text-gray-500">{deal.description}</p>
                    <p className="font-bold mt-2">Price: ₹{deal.price}</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleBidSubmit}>
                        <Input
                            type="number"
                            placeholder="Enter your bid amount"
                            value={offeredPrice}
                            onChange={(e) => setOfferedPrice(e.target.value)}
                            required
                            className="mb-4"
                        />
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Placing bid..." : "Place Bid"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default MakeBidPage;
