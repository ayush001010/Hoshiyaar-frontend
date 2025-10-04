import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));

// Read the index.html file
const indexHtml = readFileSync(join(__dirname, 'dist', 'index.html'), 'utf8');

// Handle all routes for SPA
app.get('*', (req, res) => {
  // Check if it's an API route
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  // Check if it's a static asset
  if (req.path.startsWith('/assets/') || req.path.includes('.')) {
    return res.status(404).json({ error: 'Asset not found' });
  }
  
  // For all other routes, serve the index.html
  res.send(indexHtml);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
