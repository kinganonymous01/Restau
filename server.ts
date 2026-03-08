import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = "mongodb+srv://Raj:qwerty1234@cluster0.c9fiw0n.mongodb.net/restaurant?appName=Cluster0";

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Mongoose Schema and Model
const dishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
});

const Dish = mongoose.model('Dish', dishSchema);

// API Routes
app.get('/api/menu', async (req, res) => {
  try {
    const menu = await Dish.find();
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const newDish = new Dish({ name, description, price, category });
    await newDish.save();
    res.status(201).json(newDish);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add dish' });
  }
});

app.delete('/api/menu/:id', async (req, res) => {
  try {
    await Dish.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
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
