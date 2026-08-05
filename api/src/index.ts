import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Bem-vindo à API do ShelfLogr com TypeScript!' });
});

app.get('/random', (req: Request, res: Response) => {
  res.json({ message: Math.random() * 100 });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor a correr em 127.0.0.1:${PORT}`);
});
