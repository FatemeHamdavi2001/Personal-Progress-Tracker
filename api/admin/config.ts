import { VercelRequest, VercelResponse } from '@vercel/node';
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const key = await getGeminiApiKey();
    res.json({ hasCustomKey: !!key, maskedKey: key ? `${key.slice(0,6)}...${key.slice(-4)}` : '' });
  } else if (req.method === 'POST') {
    const { apiKey } = req.body;
    if (!apiKey?.trim()) return res.status(400).json({ error: 'کلید نامعتبر' });
    const ok = await setGeminiApiKey(apiKey.trim());
    ok ? res.json({ success: true, message: 'ذخیره شد' }) : res.status(500).json({ error: 'خطا' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}