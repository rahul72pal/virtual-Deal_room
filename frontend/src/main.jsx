import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // ✅ React Query Client
import { Toaster } from "react-hot-toast"; // ✅ Import React Hot Toast
import "./index.css";
import App from "./App.jsx";
import store from "./redux/store";

// Create Query Client
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" reverseOrder={false} /> {/* ✅ Add Toaster */}
        <App />
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
