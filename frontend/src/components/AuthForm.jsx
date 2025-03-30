import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/utils/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDispatch } from "react-redux";
import { loginUser } from "@/redux/slices/authSlice";

// Define Validation Schema
const schema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").optional(),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["buyer", "seller", "admin"], { message: "Role is required" }).optional(),
});


export default function AuthForm({ isRegister }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [selectedRole, setSelectedRole] = useState("buyer"); // Default role
    const dispatch = useDispatch();

    const {
        register,
        handleSubmit,
        setValue, // To manually set the value of the role field
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        console.log("form data:", data);
        setLoading(true);
        setMessage(null);
        try {
            const url = isRegister ? "/auth/register" : "/auth/login";
            const requestData = isRegister ? { ...data, role: selectedRole } : { email: data.email, password: data.password };
    
            const response = await apiRequest("POST", url, requestData);
            
            setMessage({ type: "success", text: response.message });
            !isRegister && dispatch(loginUser({
                email: response.user.email,
                role: response.user.role,
                token: response.token,
                user: response.user
            }));
            !isRegister && (window.location.href = "/dashboard");
            if(isRegister){
                window.location.href = "/login";
            }
        } catch (error) {
            setMessage({ type: "error", text: error.message || "Something went wrong" });
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <Card className="max-w-md mx-auto shadow-lg p-6 rounded-2xl">
            <CardHeader>
                <CardTitle className="text-xl text-center">
                    {isRegister ? "Register" : "Login"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {message && (
                    <div className={`flex items-center p-3 mb-3 text-sm rounded-lg ${message.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                        {message.type === "success" ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {isRegister && (
                        <div>
                            <Input type="text" placeholder="Full Name" {...register("name")} />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        </div>
                    )}

                    <div>
                        <Input type="email" placeholder="Email" {...register("email")} />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>

                    <div>
                        <Input type="password" placeholder="Password" {...register("password")} />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                    </div>

                    {isRegister && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Role</label>
                            <Select onValueChange={(value) => { setSelectedRole(value); setValue("role", value); }}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="buyer">Buyer</SelectItem>
                                    <SelectItem value="seller">Seller</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isRegister ? "Sign Up" : "Login"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
