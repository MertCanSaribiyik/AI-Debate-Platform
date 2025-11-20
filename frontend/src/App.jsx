import axios from "axios";
import { useState, useRef, useEffect } from "react";
import ErrorNotification from "./components/ErrorNotification";
import {
  FiSend,
  FiStopCircle,
  FiUser,
  FiCpu,
  FiZap,
  FiCloudLightning,
} from "react-icons/fi";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

// Konuşmacıya göre avatar seçen bileşen
const SpeakerAvatar = ({ speaker }) => {
  let icon, bgColor;
  if (speaker.includes("Gemini")) {
    icon = <FiCpu className="h-6 w-6 text-cyan-300" />;
    bgColor = "bg-cyan-500/20";
  } else if (speaker.includes("DeepSeek")) {
    icon = <FiZap className="h-6 w-6 text-fuchsia-300" />;
    bgColor = "bg-fuchsia-500/20";
  } else {
    icon = <FiUser className="h-6 w-6 text-gray-300" />;
    bgColor = "bg-gray-500/20";
  }
  return (
    <div
      className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${bgColor}`}
    >
      {icon}
    </div>
  );
};

// Yükleme Animasyonu
const BouncingDotsLoader = () => (
  <div className="flex items-center justify-center space-x-2">
    <div className="h-2.5 w-2.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="h-2.5 w-2.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="h-2.5 w-2.5 bg-slate-300 rounded-full animate-bounce"></div>
  </div>
);

// --- ANA UYGULAMA BİLEŞENİ ---

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const isPausedRef = useRef(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startAndContinueConversation = async (topic) => {
    console.log(API_BASE_URL);
    setIsSending(true);
    setError(null);
    isPausedRef.current = false;

    setMessages((prev) => [...prev, { speaker: "🟢 Kullanıcı", text: topic }]);

    try {
      const startRes = await axios.post(`${API_BASE_URL}/api/start`, { topic });
      let { speaker, response, next } = startRes.data;
      setMessages((prev) => [...prev, { speaker, text: response }]);

      while (next && !isPausedRef.current) {
        await new Promise((res) => setTimeout(res, 1000));

        const convRes = await axios.post(`${API_BASE_URL}/api/conversation`, {
          message: response,
          current: next,
        });

        if (isPausedRef.current) break;

        speaker = convRes.data.speaker;
        response = convRes.data.response;
        next = convRes.data.next;

        setMessages((prev) => [...prev, { speaker, text: response }]);
      }
    } catch (err) {
      console.error("Bir hata oluştu:", err);
      const errorMessage =
        err.response?.data?.error ||
        "Beklenmedik bir hata oluştu. Lütfen sunucuyu kontrol edin.";
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleTopicSubmit = () => {
    if (!input.trim() || isSending) return;
    startAndContinueConversation(input);
    setInput("");
  };

  const handlePause = async () => {
    isPausedRef.current = true;
    setIsSending(false);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/reset`);
      console.log(res.data.message);
    } catch (err) {
      console.error("Sıfırlama hatası:", err);
      setError(
        "Sohbet geçmişi sunucuda sıfırlanamadı. Sayfayı yenilemek en iyisi olabilir."
      );
    }
  };

  return (
    <div className="font-sans min-h-screen text-white bg-[#111827] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] animate-aurora bg-[length:300%_300%]"></div>

      <div className="relative z-10 flex flex-col h-screen">
        <header className="p-4 text-center border-b border-white/10 backdrop-blur-sm">
          <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-fuchsia-400">
            Gemini vs DeepSeek: Yapay Zeka Tartışması
          </h1>
        </header>

        {error && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
            <ErrorNotification error={error} onClose={() => setError(null)} />
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
          {messages.map((msg, idx) => {
            const isGemini = msg.speaker.includes("Gemini");
            const isDeepSeek = msg.speaker.includes("DeepSeek");
            const isUser = !isGemini && !isDeepSeek;

            return (
              <div
                key={idx}
                className={`flex items-start gap-4 max-w-4xl mx-auto animate-fade-in-up ${
                  isGemini ? "justify-end" : "justify-start"
                } ${isUser ? "justify-center" : ""}`}
              >
                {!isGemini && <SpeakerAvatar speaker={msg.speaker} />}
                <div
                  className={`rounded-2xl p-4 max-w-[70%] ${
                    isGemini
                      ? "bg-cyan-500/10 border border-cyan-500/30 rounded-br-none"
                      : isDeepSeek
                      ? "bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-bl-none"
                      : "bg-gray-500/10 border border-gray-500/30"
                  }`}
                >
                  <div
                    className="text-sm font-bold mb-2 tracking-wider"
                    style={{
                      color: isGemini
                        ? "#67e8f9"
                        : isDeepSeek
                        ? "#f0abfc"
                        : "#d1d5db",
                    }}
                  >
                    {msg.speaker}
                  </div>
                  <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </p>
                </div>
                {isGemini && <SpeakerAvatar speaker={msg.speaker} />}
              </div>
            );
          })}

          {isSending && (
            <div className="flex justify-center items-center pt-4 gap-3 animate-fade-in-up">
              <BouncingDotsLoader />
              <p className="text-slate-400 text-sm">Yapay zeka düşünüyor...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="fixed bottom-0 left-0 right-0 p-4 z-20">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-gray-900/70 backdrop-blur-lg border border-white/10 shadow-lg">
              <input
                type="text"
                placeholder={
                  isSending
                    ? "Tartışma devam ediyor..."
                    : "Bir konu girin ve tartışmayı başlatın..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTopicSubmit()}
                disabled={isSending}
                className="flex-1 px-4 py-2 bg-transparent text-white placeholder-gray-500 focus:outline-none disabled:opacity-50"
              />

              <button
                onClick={handleTopicSubmit}
                disabled={isSending || !input.trim()}
                className="p-3 text-white rounded-full transition-colors bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                aria-label="Gönder"
              >
                <FiSend className="h-5 w-5" />
              </button>

              <button
                onClick={handlePause}
                disabled={!isSending}
                className="p-3 text-white rounded-full transition-colors bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                aria-label="Durdur ve Sıfırla"
              >
                <FiStopCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
