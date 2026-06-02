import axios from 'axios';

// 1. Base Configuration
const API_BASE_URL = 'http://localhost:5000'; 

// Axios instance banayein (Professional approach)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Fetch analyzed user behavior data from XAI Engine
 */
export const fetchAIData = async () => {
  try {
    const response = await apiClient.get('/api/data');

    // 2. Data Extraction Logic
    // Backend se hum { success: true, data: [...] } bhej rahe hain
    if (response.data && response.data.success) {
      console.log(`✅ Success: Fetched ${response.data.count} records.`);
      return response.data.data; // Sirf actual Array return karein
    } else {
      throw new Error(response.data.message || "Unknown error from AI Engine");
    }
  } catch (error) {
    // 3. Detailed Error Handling for Examiners
    if (error.response) {
      // Server se error aaya (e.g. 404, 500)
      console.error("Backend Error Response:", error.response.data);
      throw new Error(`Server Error: ${error.response.data.message || "Failed to fetch data"}`);
    } else if (error.request) {
      // Request send hui par response nahi aaya (Backend down hai)
      console.error("No Response from Server. Check if backend is running on port 5000.");
      throw new Error("XAI Backend is offline. Please start the Node.js server.");
    } else {
      console.error("Request Setup Error:", error.message);
      throw error;
    }
  }
};

/**
 * Trigger Python AI Model (Optional: If you want a button to refresh analysis)
 */
export const runXAIAnalysis = async () => {
  try {
    const response = await apiClient.get('/run-xai');
    return response.data;
  } catch (error) {
    console.error("Failed to trigger XAI Analysis:", error.message);
    throw error;
  }
};
/**
 * Check Backend Health
 */
export const checkBackendHealth = async () => {
  try {
    const response = await apiClient.get('/health');

    return response.data.success;
  } catch (error) {
    return false;
  }
};
