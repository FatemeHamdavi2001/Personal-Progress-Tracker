import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

async function getGeminiApiKey(): Promise<string | null> {
  try {
    const docRef = doc(db, 'config', 'adminSettings');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().geminiApiKey || null : null;
  } catch {
    return null;
  }
}

async function setGeminiApiKey(apiKey: string): Promise<boolean> {
  try {
    await setDoc(doc(db, 'config', 'adminSettings'), { geminiApiKey: apiKey }, { merge: true });
    return true;
  } catch {
    return false;
  }
}

async function startServer() {
  const expressApp = express();
  const PORT = process.env.PORT || 3000;
  expressApp.use(express.json({ limit: '10mb' }));

  expressApp.get('/api/admin/config', async (req, res) => {
    const key = await getGeminiApiKey();
    res.json({
      hasCustomKey: !!key,
      maskedKey: key ? `${key.slice(0, 6)}...${key.slice(-4)}` : ''
    });
  });

  expressApp.post('/api/admin/config', async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return res.status(400).json({ error: 'کلید نامعتبر است' });
    }
    const ok = await setGeminiApiKey(apiKey.trim());
    ok ? res.json({ success: true, message: 'کلید ذخیره شد' }) : res.status(500).json({ error: 'خطا در ذخیره' });
  });

  expressApp.post('/api/chat', async (req, res) => {
    try {
      const apiKey = await getGeminiApiKey();
      if (!apiKey) return res.status(500).json({ error: 'کلید API تنظیم نشده' });

      const { messages, model, systemRole, userDataContext } = req.body;
      if (!messages?.length) return res.status(400).json({ error: 'پیام ارسال نشده' });

      const ai = new GoogleGenAI({ apiKey });
      const contents = messages.map((m: any) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] }));
      const response = await ai.models.generateContent({
        model: model || 'gemini-3.6-flash',
        contents,
        config: { systemInstruction: `شما دستیار توسعه فردی هستید.${systemRole ? ` نقش: ${systemRole}` : ''}${userDataContext ? ` اطلاعات کاربر: ${userDataContext}` : ''}`, temperature: 0.7 }
      });
      res.json({ text: response.text || 'پاسخی دریافت نشد' });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'خطا' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    expressApp.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    expressApp.use(express.static(distPath));
    expressApp.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  expressApp.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}

startServer();