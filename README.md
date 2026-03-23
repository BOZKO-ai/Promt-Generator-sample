# ✨ AI Prompt Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Gemini API](https://img.shields.io/badge/Powered%20by-Gemini%20API-4285F4?logo=googlecloud)](https://makersuite.google.com/app/apikey)

Transform your simple ideas into powerful, structured prompts optimized for AI models. This tool helps you craft professional prompts for various use cases like content creation, coding, image generation, and more, with a built-in history and a beautiful dark mode interface.

![AI Prompt Generator Screenshot](https://via.placeholder.com/800x400/667eea/ffffff?text=AI+Prompt+Generator+Screenshot) <!-- Replace with an actual screenshot of your app -->

---

## 🚀 Features

*   **AI-Powered Generation:** Leverages Google's Gemini API to create detailed and structured prompts from your ideas.
*   **Multi-Category Support:** Generate prompts tailored for different needs:
    *   📝 Blog / Article
    *   💻 Code / Programming
    *   🎨 Image Generation (Midjourney/DALL·E)
    *   📈 Business & Marketing
    *   ✨ Creative Writing
    *   📚 Education & Learning
*   **Persistent History:** Automatically saves your generated prompts in the browser's local storage. Click on any past prompt to restore it.
*   **User-Friendly Interface:** A clean, modern, and responsive design with a glass-morphism effect.
*   **Dark Mode:** Supports both light and dark themes, which adapts to your system preference.
*   **Offline Fallback:** Works in demo mode with a set of mock prompts if no API key is provided, ensuring the app is always functional.
*   **Utility Actions:** Easily copy generated prompts to your clipboard or download them as `.txt` files.

---

## 🛠️ Technologies Used

*   **HTML5**
*   **CSS3** (with Flexbox, Grid, and CSS Animations)
*   **JavaScript (ES6+)**
*   **Google Gemini API**
*   **Local Storage API** (for theme and history)
*   **Font Awesome Icons**
*   **Google Fonts (Inter)**

---

## 📋 How to Use

1.  **Enter Your Idea:** Type your core idea or topic into the text area (e.g., "Explain quantum computing to a 10-year-old").
2.  **Select a Category:** Choose the type of prompt you need from the dropdown menu.
3.  **Generate:** Click the **"Generate Prompt"** button. The AI will craft a detailed, structured prompt.
4.  **Copy or Download:** Use the **"Copy"** button to copy the prompt to your clipboard or the **"Download"** button to save it as a text file.
5.  **Use History:** All generated prompts are saved on the right. Click any item in the history list to view it again.
6.  **Clear History:** Use the **"Clear history"** button to remove all saved prompts.

---

## 🔧 Getting Started (for Development)

To run this project locally and connect it to the Gemini API, follow these steps:

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge).
- A free API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/ai-prompt-generator.git
    cd ai-prompt-generator
