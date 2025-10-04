import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist'), {
  // Don't serve index.html for static files
  index: false
}));

// Read the index.html file
let indexHtml;
try {
  indexHtml = readFileSync(join(__dirname, 'dist', 'index.html'), 'utf8');
} catch (error) {
  console.error('Error reading index.html:', error);
  process.exit(1);
}

// Handle all routes for SPA
app.get('*', (req, res) => {
  // Check if it's an API route
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  // Check if it's a static asset request
  if (req.path.startsWith('/assets/') || req.path.includes('.')) {
    return res.status(404).send('Asset not found');
  }
  
  // For all other routes, serve the index.html to let React Router handle routing
  res.setHeader('Content-Type', 'text/html');
  res.send(indexHtml);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving SPA with fallback to index.html for all routes`);
});
