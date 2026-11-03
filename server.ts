import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { validateContactForm } from './src/lib/portfolioLogic.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory store for portfolio contact inquiries
  const inquiries: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    createdAt: string;
  }> = [];

  app.post('/api/contact', (req, res) => {
    const { name = '', email = '', phone = '', message = '' } = req.body || {};
    const validation = validateContactForm({ name, email, phone, message });
    if (!validation.valid) {
      res.status(400).json({ ok: false, errors: validation.errors });
      return;
    }

    const record = {
      id: `inq-${Date.now()}`,
      name: String(name).trim(),
      email: String(email).trim(),
      phone: String(phone || '').trim(),
      message: String(message).trim(),
      createdAt: new Date().toISOString(),
    };
    inquiries.unshift(record);
    res.status(200).json({ ok: true, id: record.id, recipient: 'nileshthokale0@gmail.com' });
  });

  app.get('/api/contact', (_req, res) => {
    res.status(200).json({ ok: true, count: inquiries.length, inquiries });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nilesh Portfolio server listening on http://localhost:${PORT}`);
  });
}

startServer();
