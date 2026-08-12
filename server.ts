import express from 'express';
import path from 'path';
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
    const docSnap = await getDoc(doc(db, 'config', 'adminSettings'));
    return docSnap.exists() ? docSnap.data().geminiApiKey || null : null;
  } catch { return null; }
}

async function setGeminiApiKey(apiKey: string): Promise<boolean> {
  try {
    await setDoc(doc(db, 'config', 'adminSettings'), { geminiApiKey: apiKey }, { merge: true });
    return true;
  } catch { return false; }
}

const appExpress = express();
appExpress.use(express.json());

appExpress.get('/api/admin/config', async (req, res) => {
  const key = await getGeminiApiKey();
  res.json({ hasCustomKey: !!key, maskedKey: key ? `${key.slice(0,6)}...${key.slice(-4)}` : '' });
});

appExpress.post('/api/admin/config', async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey?.trim()) return res.status(400).json({ error: 'کلید نامعتبر' });
  const ok = await setGeminiApiKey(apiKey.trim());
  ok ? res.json({ success: true, message: 'ذخیره شد' }) : res.status(500).json({ error: 'خطا' });
});

appExpress.post('/api/chat', async (req, res) => {
  try {
    const apiKey = await getGeminiApiKey();
    if (!apiKey) return res.status(500).json({ error: 'کلید تنظیم نشده' });
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

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  appExpress.use(express.static(distPath));
  appExpress.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

export default appExpress;