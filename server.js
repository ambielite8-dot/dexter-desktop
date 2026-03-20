const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const mockCards = [
  {
    id: uuidv4(),
    type: 'Action',
    message: 'I notice you\'re browsing product pages. Would you like me to compare prices across different retailers?',
    action: 'Compare prices on similar items'
  },
  {
    id: uuidv4(),
    type: 'Suggestion',
    message: 'Based on your recent activity, I can help you track prices and notify you when items go on sale.',
    action: 'Enable price tracking'
  },
  {
    id: uuidv4(),
    type: 'Insight',
    message: 'You\'ve been researching this topic for a while. Would you like a summary of key findings?',
    action: 'Generate summary'
  }
];

app.post('/context', (req, res) => {
  const { url, title, mode, sessionId, timestamp, message } = req.body;
  
  console.log('Received context:');
  console.log('  URL:', url);
  console.log('  Title:', title);
  console.log('  Mode:', mode);
  console.log('  Session:', sessionId);
  console.log('  Timestamp:', timestamp);
  console.log('  Message:', message);
  console.log('---');

  const shuffledCards = [...mockCards]
    .sort(() => Math.random() - 0.5)
    .map(card => ({
      ...card,
      id: uuidv4()
    }));

  res.json({
    cards: shuffledCards
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Dexter backend server running on http://localhost:${PORT}`);
  console.log(`Endpoint: POST /context`);
});