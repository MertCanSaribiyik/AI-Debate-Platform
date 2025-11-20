import express from "express";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const GEMINI_SYSTEM_INSTRUCTION = `
Sen Gemini adlı bir yapay zeka asistanısın. Kullanıcının belirlediği konu hakkında, diğer yapay zeka asistanı olan DeepSeek ile bir tartışma yürütüyorsun.
Görevin, her turda SADECE KENDİ GÖRÜŞÜNÜ ifade etmektir. Asla DeepSeek'in yerine cevap üretme veya bir diyalog simüle etme.
Kısa, net ve kararlı cevaplar ver. Tartışmayı canlı tutmaya çalış.
`;

const DEEPSEEK_SYSTEM_PROMPT = `
Sen DeepSeek adlı bir yapay zeka asistanısın. Kullanıcının belirlediği konu hakkında, diğer yapay zeka asistanı olan Gemini ile bir tartışma yürütüyorsun.
Görevin, her turda SADECE KENDİ GÖRÜŞÜNÜ ifade etmektir. Asla Gemini'nin yerine cevap üretme veya bir diyalog simüle etme.
Kısa, net ve kararlı yanıtlar ver. Tartışmayı canlı tutmak için güçlü argümanlar sun.
`;

let geminiChat;
const openaiHistory = [
  {
    role: "system",
    content: DEEPSEEK_SYSTEM_PROMPT,
  },
];

function initializeGeminiChat() {
  geminiChat = gemini.chats.create({
    model: "gemini-2.5-flash-preview-05-20",
    history: [],
    config: {
      temperature: 0.6,
      systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
    },
  });
}

async function askGemini(prompt) {
  if (!geminiChat) {
    console.log("initializing Gemini chat...");
    initializeGeminiChat();
  }

  //Olası bir çökme öncesi mevcut chat nesnesini bir değişkende tuttum. (Kullanıcı gemini vevap verirken sohbeti durdurursa)
  const currentChatInstance = geminiChat;
  const response = await currentChatInstance.sendMessage({ message: prompt });

  //Cevabı aldıktan sonra, global `geminiChat` değişkeninin sıfırlanıp sıfırlanmadığını kontrol et.
  if (geminiChat === null) {
    return; //Sohbet zaten sıfırlandığı için history'yi yönetmeye gerek yok.
  }

  //Eğer sohbet sıfırlanmadıysa, güvenle history'yi yönetebiliriz.
  if (geminiChat.history.length > 50) {
    geminiChat.history.splice(0, geminiChat.history.length - 50);
  }

  return response.text.trim();
}

async function askDeepSeek(prompt) {
  openaiHistory.push({ role: "user", content: prompt });
  const response = await openai.chat.completions.create({
    model: "deepseek/deepseek-chat-v3-0324:free",
    messages: openaiHistory,
    temperature: 0.7,
    top_p: 1,
  });
  const message = response.choices[0].message.content.trim();
  openaiHistory.push({ role: "assistant", content: message });
  if (openaiHistory.length > 50) {
    openaiHistory.splice(1, openaiHistory.length - 50);
  }
  return message;
}

app.post("/api/start", async (req, res) => {
  const { topic } = req.body;

  const userIntro = `Kullanıcı senin diğer yapay zeka asistanı ile şu konuyu tartışmanı istiyor : "${topic}".
Lütfen bu konudaki AÇILIŞ ARGÜMANINI belirterek tartışmayı başlat. Sadece kendi ilk fikrini söyle, karşı tarafın cevabını bekle.`;

  try {
    const starter = Math.random() < 0.5 ? "gemini" : "deepseek";
    let response, speaker, next;

    if (starter === "gemini") {
      response = await askGemini(userIntro);
      speaker = "🔵 Gemini";
      next = "deepseek";
    } else {
      response = await askDeepSeek(userIntro);
      speaker = "🔴 DeepSeek";
      next = "gemini";
    }
    res.json({
      speaker,
      response,
      next,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/conversation", async (req, res) => {
  const { message, current } = req.body;
  try {
    let response, speaker, next;
    if (current === "gemini") {
      const prompt = `DeepSeek'in argümanı şu: "${message}"\nBu argümana karşı senin cevabın nedir? Sadece kendi cevabını ver.`;
      response = await askGemini(prompt);
      speaker = "🔵 Gemini";
      next = "deepseek";
    } else {
      const prompt = `Gemini'nin argümanı şu: "${message}"\nBu argümana karşı senin cevabın nedir? Sadece kendi cevabını ver.`;
      response = await askDeepSeek(prompt);
      speaker = "🔴 DeepSeek";
      next = "gemini";
    }
    res.json({ speaker, response, next });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/reset", async (req, res) => {
  geminiChat = null;
  openaiHistory.splice(1);
  res.status(200).json({
    success: true,
    message: "Sohbet geçmişi sıfırlandı.",
  });
});
