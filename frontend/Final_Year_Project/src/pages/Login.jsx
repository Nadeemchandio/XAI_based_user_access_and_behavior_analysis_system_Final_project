import { CheckBackendHealth } from "../services/apiService";
const handleLogin = async () => {

    const isBackendOnline = await checkBackendHealth();

    if (!isBackendOnline) {
        alert("XAI Engine is Offline. Please start backend server.");
        return;
    }

    // Backend online ho to dashboard open karo
    navigate("/dashboard");
};