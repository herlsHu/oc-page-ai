import express from 'express';
// import { Character } from '../models/character'; // Remove Mongoose model import
import { generateAIContent } from '../services/ai';

const router = express.Router();

// In-memory storage for demo (no persistence)
let currentCharacter: any = {}; // Simple object to hold current character data in memory

// Middleware to update current character from request body (for demo)
router.use(express.json()); // Ensure body parsing
router.use((req, res, next) => {
  // In a real app, you'd manage sessions and specific character IDs
  // For this demo, we'll just assume the context in the body is the latest form state
  if (req.body && req.body.context) {
    // Update in-memory character with context from request for AI use
    // Note: This is a very simplistic approach for a single-user demo
    currentCharacter = { ...req.body.context };
  }
  next();
});

// --- Simplified or placeholder routes for demo without DB ---

// Get all characters (placeholder)
router.get('/', (req, res) => {
  // In a real app, this would fetch from DB
  res.json([currentCharacter]); // Return the current character as a list
});

// Get character by ID (placeholder)
router.get('/:id', (req, res) => {
  // In a real app, this would fetch from DB by ID
  res.json(currentCharacter); // Return the current character regardless of ID
});

// Create new character (placeholder)
router.post('/', (req, res) => {
  // In a real app, this would save to DB
  // For demo, just update in-memory character if body is sent
  if (req.body) {
     currentCharacter = { ...req.body };
  }
  res.status(201).json(currentCharacter); // Return the updated in-memory character
});

// Update character (placeholder)
router.put('/:id', (req, res) => {
   // In a real app, this would update in DB by ID
  // For demo, just update in-memory character if body is sent
  if (req.body) {
     currentCharacter = { ...req.body };
  }
  res.json(currentCharacter); // Return the updated in-memory character
});

// Delete character (placeholder)
router.delete('/:id', (req, res) => {
  // In a real app, this would delete from DB by ID
  // For demo, just clear the in-memory character
  currentCharacter = {};
  res.json({ message: 'Character deleted from memory (demo)' });
});

// Generate AI content (modified to use in-memory context or request body context)
router.post('/generate-ai-content', async (req, res) => {
  try {
    const { field, context } = req.body;
    
    // Use context directly from request body as it contains latest form state
    if (!field || !context) {
      return res.status(400).json({
        message: 'Missing required fields',
        fields: ['field', 'context']
      });
    }

    // The generateAIContent service needs to work with the context object
    const content = await generateAIContent(field, context);
    res.json({ content });
  } catch (error) {
    // Keep the original error handling for AI service issues
    console.error('Error generating AI content:', error);
    res.status(500).json({ message: 'Error generating AI content', error: (error as Error).message });
  }
});

export const characterRouter = router; 