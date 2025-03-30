import AuthForm from "@/components/AuthForm";

export default function Register() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <AuthForm isRegister={true} />
        </div>
    );
}
