import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Login from "./Login";


export default function Home() {
    const token = useSelector((state) => state.auth.token); // Check authentication

    return token ? <Navigate to="/dashboard" /> : <Login />;
}
