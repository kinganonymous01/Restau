import express from 'express';
import { neon } from '@neondatabase/serverless';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Neon DB connection
const NEON_URI = "postgresql://neondb_owner:npg_X1GBiumy9Ttv@ep-calm-sea-a14uos77-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(NEON_URI);

// Initialize database table
async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS dishes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        category VARCHAR(100) NOT NULL
      );
    `;
    console.log('Connected to Neon DB and verified dishes table');
  } catch (err) {
    console.error('Neon DB connection/initialization error:', err);
  }
}
initDB();

// API Routes
app.get('/api/menu', async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM dishes ORDER BY id ASC`;
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const rows = await sql`
      INSERT INTO dishes (name, description, price, category) 
      VALUES (${name}, ${description}, ${price}, ${category}) 
      RETURNING *
    `;
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add dish' });
  }
});

app.delete('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM dishes WHERE id = ${id}`;
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete dish' });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
