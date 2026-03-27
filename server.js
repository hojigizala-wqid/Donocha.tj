import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;
const apiKey = process.env.ARK_API_KEY;
const model = process.env.ARK_MODEL;

if (!apiKey || !model) {
  console.error("Ошибка: нет ARK_API_KEY или ARK_MODEL в .env");
  process.exit(1);
}

const client = new OpenAI({
  apiKey,
  baseURL: "https://ark.ap-southeast.bytepluses.com/api/v3",
});

app.use(express.json());
app.use(express.static(__dirname));

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = String(req.body.message || "").trim();

    if (!userMessage) {
      return res.status(400).json({ reply: "Пустое сообщение." });
    }

    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "Ты Donocha AI — умный, вежливый, полезный ассистент платформы Donocha.tj. Отвечай понятно и красиво. Поддерживай таджикский, русский, английский и другие языки. Если пользователь пишет на одном языке — отвечай на этом же языке.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "Извините, модель не вернула ответ.";

    res.json({ reply });
  } catch (error) {
    console.error("BytePlus API error:", error?.response?.data || error.message);
    res.status(500).json({
      reply: "Ошибка подключения к AI. Проверь ключ, model ID и доступ к BytePlus.",
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Donocha.tj started: http://localhost:${port}`);
});