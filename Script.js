// AI Prompt Generator - Main Application Logic
// Handles API calls, UI interactions, history, and theming

// ======================== DOM Elements ========================
const userIdeaTextarea = document.getElementById('userIdea');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const outputDiv = document.getElementById('outputText');
const loadingOverlay = document.getElementById('loadingOverlay');
const categorySelect = document.getElementById('categorySelect');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const historyListDiv = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// ======================== State Management ========================
let currentPrompt = '';
let promptHistory = [];

// Load history from localStorage
function loadHistory() {
  const stored = localStorage.getItem('ai_prompt_history');
  if (stored) {
    try {
      promptHistory = JSON.parse(stored);
      renderHistory();
    } catch (e) {
      console.error('Failed to parse history', e);
    }
  }
}

// Save history to localStorage
function saveHistory() {
  localStorage.setItem('ai_prompt_history', JSON.stringify(promptHistory));
  renderHistory();
}

// Add prompt to history
function addToHistory(promptText, userIdea, category) {
  const historyItem = {
    id: Date.now(),
    prompt: promptText,
    userIdea: userIdea.substring(0, 60),
    category: category,
    timestamp: new Date().toISOString()
  };
  promptHistory.unshift(historyItem); // Add to beginning
  // Keep only last 20 items
  if (promptHistory.length > 20) promptHistory.pop();
  saveHistory();
}

// Render history list
function renderHistory() {
  if (!historyListDiv) return;

  if (promptHistory.length === 0) {
    historyListDiv.innerHTML = '<div class="empty-history">No history yet. Generated prompts will be saved.</div>';
    return;
  }

  historyListDiv.innerHTML = promptHistory.map(item => `
    <div class="history-item" data-id="${item.id}">
      <div class="history-preview">${escapeHtml(item.prompt.substring(0, 80))}${item.prompt.length > 80 ? '...' : ''}</div>
      <div class="history-date">${new Date(item.timestamp).toLocaleString()} · ${item.category}</div>
    </div>
  `).join('');

  // Add click event listeners to history items
  document.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = parseInt(el.dataset.id);
      const found = promptHistory.find(item => item.id === id);
      if (found) {
        outputDiv.innerHTML = escapeHtml(found.prompt).replace(/\n/g, '<br>');
        currentPrompt = found.prompt;
        // Optionally restore user idea
        if (found.userIdea) userIdeaTextarea.value = found.userIdea;
      }
    });
  });
}

// Clear entire history
function clearHistory() {
  if (confirm('Are you sure you want to clear all prompt history?')) {
    promptHistory = [];
    saveHistory();
    showToast('History cleared!', 'info');
  }
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ======================== API Integration ========================
// Generate structured prompt using Gemini API
async function generatePrompt(userIdea, category) {
  // Check if in demo mode or missing API key
  if (API_CONFIG.DEMO_MODE || API_CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('Using demo mode - add your Gemini API key in Config.js');
    return generateMockPrompt(userIdea, category);
  }

  const promptTemplate = `You are an expert prompt engineer. Create a detailed, structured, and highly effective prompt based on the user's idea and selected category.

User's idea: "${userIdea}"
Category: ${category}

Generate a professional prompt that is clear, specific, and optimized for AI models. Include relevant context, constraints, output format, and style guidance. The prompt should be ready to use for generating high-quality results.

Return ONLY the generated prompt text, no additional explanations or meta-commentary. Make it engaging and well-structured.`;

  const models = API_CONFIG.MODELS || [API_CONFIG.API_URL];
  let lastError = null;

  for (const modelUrl of models) {
    try {
      console.log(`Trying model: ${modelUrl}`);
      const url = `${modelUrl}?key=${API_CONFIG.GEMINI_API_KEY}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptTemplate }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
        })
      });

      // If quota exceeded, try the next model
      if (response.status === 429 || response.status === 503) {
        const errorData = await response.json();
        lastError = errorData.error?.message || `HTTP ${response.status}`;
        console.warn(`Quota/service issue for ${modelUrl}, trying next model...`);
        continue;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) throw new Error('No response from AI');

      return generatedText.trim();

    } catch (error) {
      // Only skip to next model on quota/network errors; rethrow real errors
      if (error.message.includes('quota') || error.message.includes('429') || error.message.includes('503')) {
        lastError = error.message;
        continue;
      }
      throw new Error(`Failed to generate prompt: ${error.message}`);
    }
  }

  // All models failed – use offline mock fallback
  console.warn('All models quota-limited. Using offline mock fallback.');
  return generateMockPrompt(userIdea, category);
}

// Mock prompt generator (fallback when no API key)
function generateMockPrompt(userIdea, category) {
  const mockPrompts = {
    Blog: `# Blog Post Prompt: "${userIdea}"
    
**Title:** [Create an engaging title]
**Target Audience:** [Define your readers]
**Tone:** Professional yet conversational
**Structure:**
1. Hook with a compelling statistic or question
2. Explain the core concept with examples
3. Share actionable insights
4. Conclude with a thought-provoking takeaway

**Writing Style:** Use short paragraphs, bullet points, and real-world analogies to make complex ideas accessible. Include a call-to-action at the end.`,

    Code: `# Code Generation Prompt: "${userIdea}"

**Objective:** Generate clean, production-ready ${category} solution
**Language/Framework:** [Specify based on context]
**Requirements:**
- Include error handling
- Add JSDoc/comments
- Follow best practices and design patterns
- Provide example usage

**Output Format:** 
\`\`\`[language]
// Code here
\`\`\`

**Additional:** Consider edge cases and performance optimizations.`,

    Image: `# Image Generation Prompt: "${userIdea}"

**Style:** Photorealistic / Digital art / Cinematic (choose based on context)
**Subject:** [Detailed description]
**Composition:** [Describe framing, perspective, lighting]
**Mood:** [Atmosphere, color palette]
**Details:** [Specific elements, textures, background]

**Quality Tags:** 8k, highly detailed, sharp focus, professional photography style, award-winning composition`,

    Business: `# Business Strategy Prompt: "${userIdea}"

**Context:** [Define business scenario]
**Objective:** Generate actionable business insights
**Analysis Framework:** SWOT, PESTLE, or Porter's Five Forces
**Deliverables:**
- Executive summary
- Key metrics to track
- Implementation roadmap
- Risk mitigation strategies

**Tone:** Data-driven, strategic, professional`,

    Creative: `# Creative Writing Prompt: "${userIdea}"

**Genre:** [Specify genre]
**Protagonist:** [Character description]
**Setting:** [Time and place]
**Conflict:** [Central tension]
**Writing Style:** Show don't tell, vivid imagery, emotional resonance

**Prompt Structure:** Write an opening scene that hooks the reader, establishes character voice, and sets up the central conflict. Use sensory details and authentic dialogue.`,

    Education: `# Educational Prompt: "${userIdea}"

**Learning Objective:** [Define what students will learn]
**Target Level:** Beginner / Intermediate / Advanced
**Teaching Approach:** Socratic method with examples
**Content Structure:**
1. Concept introduction with analogy
2. Step-by-step explanation
3. Interactive example or exercise
4. Summary and knowledge check

**Include:** Visual descriptions, real-world applications, common misconceptions addressed.`
  };

  return mockPrompts[category] || mockPrompts.Blog;
}

// ======================== UI Helpers ========================
function showLoading() {
  loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  loadingOverlay.classList.add('hidden');
}

function displayOutput(text) {
  outputDiv.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
  currentPrompt = text;
}

function showError(message) {
  outputDiv.innerHTML = `<span style="color: #e74c3c;">❌ ${escapeHtml(message)}</span>`;
  currentPrompt = '';
}

function showToast(message, type = 'info') {
  // Simple toast notification
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'error' ? '#e74c3c' : '#667eea'};
    color: white;
    padding: 0.8rem 1.5rem;
    border-radius: 2rem;
    font-size: 0.9rem;
    z-index: 1000;
    animation: fadeInOut 2s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

// ======================== Main Action ========================
async function handleGenerate() {
  const userIdea = userIdeaTextarea.value.trim();
  if (!userIdea) {
    showError('Please enter an idea or topic first!');
    return;
  }

  const category = categorySelect.value;

  showLoading();
  outputDiv.innerHTML = '<span class="placeholder-text">✨ Generating...</span>';

  try {
    const generatedPrompt = await generatePrompt(userIdea, category);
    displayOutput(generatedPrompt);
    addToHistory(generatedPrompt, userIdea, category);
    showToast('Prompt generated successfully!', 'success');
  } catch (error) {
    console.error(error);
    showError(error.message || 'Failed to generate prompt. Please try again.');
    showToast('Generation failed', 'error');
  } finally {
    hideLoading();
  }
}

// Copy to clipboard
async function handleCopy() {
  if (!currentPrompt) {
    showToast('Nothing to copy! Generate a prompt first.', 'error');
    return;
  }

  try {
    await navigator.clipboard.writeText(currentPrompt);
    showToast('Copied to clipboard! 📋', 'success');
  } catch (err) {
    showToast('Failed to copy', 'error');
  }
}

// Download as .txt
function handleDownload() {
  if (!currentPrompt) {
    showToast('No prompt to download!', 'error');
    return;
  }

  const blob = new Blob([currentPrompt], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-prompt-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Downloaded! 📥', 'success');
}

// Clear input and output
function handleClear() {
  userIdeaTextarea.value = '';
  outputDiv.innerHTML = '<span class="placeholder-text">✨ Your professional prompt will appear here...</span>';
  currentPrompt = '';
  showToast('Cleared', 'info');
}

// ======================== Theme Toggle ========================
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else if (savedTheme === 'light') {
    document.body.classList.remove('dark-mode');
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// ======================== Event Listeners & Initialization ========================
generateBtn.addEventListener('click', handleGenerate);
copyBtn.addEventListener('click', handleCopy);
downloadBtn.addEventListener('click', handleDownload);
clearBtn.addEventListener('click', handleClear);
themeToggleBtn.addEventListener('click', toggleTheme);
clearHistoryBtn.addEventListener('click', clearHistory);

// Allow Enter key shortcuts? Not to conflict, but optional: 
userIdeaTextarea.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    handleGenerate();
  }
});

// Load history and theme on startup
loadHistory();
initTheme();

// Add CSS animation for toast
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
    15% { opacity: 1; transform: translateX(-50%) translateY(0); }
    85% { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  }
`;
document.head.appendChild(style);

console.log('AI Prompt Generator ready! 🚀');