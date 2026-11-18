// Entry point: creates the Express app and starts listening.
import express from 'express';
import projectsRouter from './routes/projects.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Turns a JSON request body into req.body.
app.use(express.json());

app.use('/api/projects', projectsRouter);

// Any other /api path does not exist.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Central error handler. Express calls this when a route throws.
// Four arguments are what mark it as an error handler.
app.use((err, req, res, next) => {
  // express.json() could not parse the body: that is the client's mistake.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
