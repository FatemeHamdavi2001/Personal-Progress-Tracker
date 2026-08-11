import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // File path to persist Admin GEMINI API Key across server restarts
  const ADMIN_KEY_FILE = path.join(process.cwd(), '.admin_key.json');

  let adminConfiguredApiKey = process.env.GEMINI_API_KEY || '';

  // Load key from disk if available
  if (fs.existsSync(ADMIN_KEY_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(ADMIN_KEY_FILE, 'utf-8'));
      if (data && data.apiKey) {
        adminConfiguredApiKey = data.apiKey;
      }
    } catch (err) {
      console.error('Failed to load admin key file:', err);
    }
  }

  // API Endpoint to Get/Set Admin API Key Config
  app.get('/api/admin/config', (req, res) => {
    return res.json({
      hasCustomKey: Boolean(adminConfiguredApiKey),
      maskedKey: adminConfiguredApiKey
        ? `${adminConfiguredApiKey.slice(0, 6)}...${adminConfiguredApiKey.slice(-4)}`
        : ''
    });
  });

  app.post('/api/admin/config', (req, res) => {
    const { apiKey } = req.body;
    if (typeof apiKey === 'string') {
      adminConfiguredApiKey = apiKey.trim();
      try {
        fs.writeFileSync(ADMIN_KEY_FILE, JSON.stringify({ apiKey: adminConfiguredApiKey }));
      } catch (err) {
        console.error('Failed to write admin key file:', err);
      }
      return res.json({ success: true, message: 'کلید API با موفقیت در سرور ذخیره شد و برای تمامی کاربران فعال گردید.' });
    }
    return res.status(400).json({ error: 'کلید API نامعتبر است.' });
  });

  // API Endpoint for Gemini Chatbot (Accessible to ALL users)
  app.post('/api/chat', async (req, res) => {
    try {
      const apiKey = adminConfiguredApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'کلید API هوش مصنوعی توسط مدیر سیستم تنظیم نشده است. لطفاً از پنل ادمین کلید API را وارد نمایید.'
        });
      }

      const { messages, model, systemRole, userDataContext } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'ارسال تاریخچه پیام‌ها الزامی است.' });
      }

      // Default to valid Gemini flash model
      const selectedModel = model || 'gemini-3.6-flash';

      const defaultSystemInstruction =
        `شما دستیار و مربی هوشمند توسعه فردی، مدیریت زمان و بهره‌وری در برنامه «You Can Do it» هستید.\n` +
        `وظیفه شما راهنمایی کاربر برای دستیابی به اهداف، بهبود زمان تمرکز، ساخت عادت‌های روزانه پایدار و برنامه‌ریزی هوشمند است.\n` +
        `پاسخ‌ها را صمیمی، انگیزشی، دقیق و با فرمت مرتب ارائه دهید.\n` +
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
