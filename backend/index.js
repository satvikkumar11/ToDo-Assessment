import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import admin from 'firebase-admin'; // Keep for initializeApp and credential if not using granular imports
import { getFirestore, FieldValue } from 'firebase-admin/firestore'; // For Firestore specific operations
import authMiddleware from './middleware/authMiddleware.js';
import serviceAccount from './firebaseServiceAccountKey.json' with { type: 'json' };
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1); // Exit if Firebase initialization fails
}

const db = getFirestore();
const todosCollection = db.collection('todos');

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY is not defined in .env file.");
  process.exit(1);
}
if (!SLACK_WEBHOOK_URL) {
  console.error("Error: SLACK_WEBHOOK_URL is not defined in .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // To parse JSON request bodies

// CORS Configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

// Routes
// POST /todos – Add a new todo
app.post('/todos', authMiddleware, async (req, res) => {
  try {
    const { title, description = '' } = req.body;
    const userId = req.userId; // From authMiddleware

    if (!title) {
      return res.status(400).send({ error: 'Title and description are required.' });
    }

    const newTodo = {
      userId,
      title,
      description,
      state: 'pending', // Default state
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await todosCollection.add(newTodo);
    const todoData = await docRef.get();
    res.status(201).send({ id: docRef.id, ...todoData.data() });
  } catch (error) {
    console.error('Error adding todo:', error);
    res.status(500).send({ error: 'Failed to add todo.' });
  }
});

// GET /todos – Fetch all todos for the authenticated user
app.get('/todos', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // From authMiddleware
    const snapshot = await todosCollection.where('userId', '==', userId).orderBy('createdAt', 'desc').get();

    if (snapshot.empty) {
      return res.status(200).send([]);
    }

    const todos = [];
    snapshot.forEach(doc => {
      todos.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).send(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).send({ error: 'Failed to fetch todos.' });
  }
});

// DELETE /todos/:id – Delete a todo
app.delete('/todos/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // From authMiddleware
    const todoId = req.params.id;

    const todoRef = todosCollection.doc(todoId);
    const doc = await todoRef.get();

    if (!doc.exists) {
      return res.status(404).send({ error: 'Todo not found.' });
    }

    if (doc.data().userId !== userId) {
      return res.status(403).send({ error: 'Forbidden: You do not own this todo.' });
    }

    await todoRef.delete();
    res.status(200).send({ message: 'Todo deleted successfully.' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).send({ error: 'Failed to delete todo.' });
  }
});

// PUT /todos/:id - Update a todo
app.put('/todos/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // From authMiddleware
    const todoId = req.params.id;
    const { title, description, state } = req.body;

    // Validate that at least one field is being updated
    if (title === undefined && description === undefined && state === undefined) {
      return res.status(400).send({ error: 'No fields to update provided.' });
    }

    // Validate state if provided
    if (state !== undefined && !['pending', 'completed'].includes(state)) {
      return res.status(400).send({ error: "Invalid state. Must be 'pending' or 'completed'." });
    }

    const todoRef = todosCollection.doc(todoId);
    const doc = await todoRef.get();

    if (!doc.exists) {
      return res.status(404).send({ error: 'Todo not found.' });
    }

    if (doc.data().userId !== userId) {
      return res.status(403).send({ error: 'Forbidden: You do not own this todo.' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (state !== undefined) updateData.state = state;
    updateData.updatedAt = FieldValue.serverTimestamp();

    await todoRef.update(updateData);
    const updatedDoc = await todoRef.get();
    res.status(200).send({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).send({ error: 'Failed to update todo.' });
  }
});

// POST /summarize – Summarize todos and send to Slack
app.post('/summarize', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // From authMiddleware

    const snapshot = await todosCollection
      .where('userId', '==', userId)
      .where('state', '==', 'pending')
      .get();

    if (snapshot.empty) {
      return res.status(404).send({ message: 'No pending todos to summarize.' });
    }

    const pendingTodos = [];
    snapshot.forEach(doc => {
      pendingTodos.push({ id: doc.id, ...doc.data() });
    });

    // Prepare prompt for Gemini AI
    let prompt = "Analyze the following list of pending tasks. Identify any common themes, priorities, or logical groupings. Then, generate a concise, single-paragraph summary that presents these tasks in the most coherent and insightful order. The order of the tasks in the input list should NOT influence the order in your summary. Focus on creating a summary that flows well and highlights the most important aspects or connections between the tasks. Return only the summary paragraph."
    pendingTodos.forEach(todo => {
      prompt += `- ${todo.title}: ${todo.description}\n`;
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    // Send summary to Slack
    await axios.post(SLACK_WEBHOOK_URL, { text: `Todo Summary:\n${summary}` });

    res.status(200).send({ message: 'Summary sent to Slack successfully.', summary });

  } catch (error) {
    console.error('Error in /summarize endpoint:', error);
    if (error.isAxiosError) {
      console.error('Axios error details:', error.toJSON());
      return res.status(500).send({ error: 'Failed to send summary to Slack.' });
    }
    // Check if it's a Gemini related error (this is a generic check, specific error types might be available)
    if (error.message && error.message.includes('GoogleGenerativeAI')) {
       return res.status(500).send({ error: 'Failed to generate summary with AI.' });
    }
    res.status(500).send({ error: 'Failed to process summarize request.' });
  }
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Todo API is running!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
