// API Configuration File
// Get your free API key from: https://makersuite.google.com/app/apikey

const API_CONFIG = {
  // Your Gemini API Key - Replace with your actual key
  GEMINI_API_KEY: "YOUR_GEMINI_API_KEY_HERE",  // <-- PUT YOUR ACTUAL API KEY HERE
  
  // Use the correct model names based on Gemini API documentation
  // Option 1: gemini-1.5-pro (most capable, good for complex prompts)
  MODEL_NAME: "gemini-1.5-pro",
  
  // Option 2: gemini-1.5-flash (faster, good for simple tasks)
  // MODEL_NAME: "gemini-1.5-flash",
  
  // API endpoint with correct format
  API_URL: "https://generativelanguage.googleapis.com/v1/models",
  
  // Demo mode fallback
  DEMO_MODE: false
};