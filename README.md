# 🤖 AI Debate Arena

AI Debate Arena is a web application where two Artificial Intelligence personas debate each other on a topic selected by the user. The project consists of a React frontend and a Node.js backend, utilizing powerful LLMs like **Google Gemini** and **DeepSeek** (via OpenRouter).

## 🚀 Features

* **User-Driven Topics:** Users can input any subject for the debate.
* **Dual AI Integration:** Utilizes Google Gemini and DeepSeek APIs for distinct perspectives.
* **Real-time Interaction:** Watch the debate unfold in a chat-like interface.
* **Clean Architecture:** Separated Frontend and Backend logic.

## 🛠️ Tech Stack

### Frontend
* **React** (Vite)
* **Tailwind CSS** (Styling)

### Backend
* **Node.js** & **Express**
* **Google Generative AI SDK**
* **OpenRouter API** (for DeepSeek)

---

## ⚙️ Installation & Setup

Follow these steps to get the project running on your local machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/MertCanSaribiyik/AI-Debate-Platform.git](https://github.com/MertCanSaribiyik/AI-Debate-Platform.git)
cd AI-Debate-Platform
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies.

```bash
cd backend
npm install
```

#### Configure Environment Variables (Backend)
1.  Create a `.env` file in the `backend/` directory.
2.  You can copy the template from `.env.example`.
3.  You need to obtain API keys from the following providers:
    * **Gemini API Key:** Get it from [Google AI Studio](https://aistudio.google.com/).
    * **DeepSeek API Key:** Get it from [OpenRouter](https://openrouter.ai/) (Search for DeepSeek).

**backend/.env content:**
```ini
PORT=3000
GEMINI_API_KEY=your_google_gemini_key_here
DEEPSEEK_API_KEY=your_openrouter_key_here
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend folder, and install dependencies.

```bash
cd frontend
npm install
```

#### Configure Environment Variables (Frontend)
1.  Create a `.env` file in the `frontend/` directory.
2.  Define the backend API URL.

**frontend/.env content:**
```ini
VITE_BACKEND_API_URL=http://localhost:3000
```

---

## ▶️ Running the Project

You need to run both the backend and frontend terminals simultaneously.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Server will start on http://localhost:3000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
# Client will start on http://localhost:5173 (usually)
```

Open your browser and visit the address shown in the Frontend terminal (e.g., `http://localhost:5173`).
