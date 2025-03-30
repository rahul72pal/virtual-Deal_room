import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import Home from "./pages/Home";
import DealsPage from "./pages/DealsPage"; // Seller Deals Page
import BuyerDealsPage from "./pages/BuyerDealsPage"; // Buyer Deals Page
import MakeBidPage from "./pages/MakeBidPage";
import MessagesPage from "./pages/MessagesPage";
import AllMessagesPage from "./pages/AllMessagesPage";

function App() {
  const token = useSelector((state) => state.auth.token);
  const role = useSelector((state) => state.auth.user?.role);

  return (
    <>
      <div className="w-full flex justify-center py-4">
        <h1 className="text-4xl text-blue-600">Virtual Deal Room</h1>
      </div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
  
          {!token && <Route path="/login" element={<Login />} />}
          {!token && <Route path="/register" element={<Register />} />}
  
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/deals/:id" element={<MakeBidPage />} />
            <Route path="/messages/:dealId" element={<MessagesPage />} />
            <Route path="/messages/all" element={<AllMessagesPage />} />
  
            {/* Show different deal pages based on user role */}
            {role === "seller" && (
              <Route path="/deals" element={<DealsPage />} />
            )}
            {role === "buyer" && (
              <Route path="/deals" element={<BuyerDealsPage />} />
            )}
          </Route>
  
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
