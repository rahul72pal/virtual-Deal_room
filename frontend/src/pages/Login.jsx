import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/AuthForm";
import { Button } from "@/components/ui/button";

export default function Login() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-4">
            <AuthForm isRegister={false} />
            <Button variant="outline" onClick={() => navigate("/register")}>
                Go to Register
            </Button>
        </div>
    );
}
