import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Endpoint for Gemini Chatbot
  app.post('/api/chat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'کلید GEMINI_API_KEY تنظیم نشده است. لطفاً کلید API را بررسی فرمایید.'
        });
      }

      const { messages, model, systemRole, userDataContext } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'ارسال تاریخچه پیام‌ها الزامی است.' });
      }

      const selectedModel = model || 'gemini-3.5-flash';

      const defaultSystemInstruction =
        `شما دستیار و مربی هوشمند توسعه فردی، مدیریت زمان و بهره‌وری در برنامه «ردیاب پیشرفت شخصی» هستید.\n` +
        `وظیفه شما راهنمایی کاربر برای دستیابی به اهداف، بهبود زمان تمرکز، ساخت عادت‌های روزانه پایدار و برنامه‌ریزی هوشمند است.\n` +
        `پاسخ‌ها را صمیمی، انگیزشی، دقیق و با فرمت مرتب به زبان فارسی ارائه دهید.\n` +
        (systemRole ? `نقش تخصصی فعال شما: ${systemRole}\n` : '') +
        (userDataContext ? `اطلاعات و آمارهای فعلی کاربر در برنامه:\n${userDataContext}\n` : '');

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Format conversation contents for Gemini generateContent
      const contents = messages.map((m: { role: string; text: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction: defaultSystemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || 'پاسخی دریافت نشد.';

      return res.json({ text: replyText });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      return res.status(500).json({
        error: error?.message || 'خطا در برقراری ارتباط با مربی هوشمند.'
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
