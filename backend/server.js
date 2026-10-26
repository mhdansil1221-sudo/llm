import express from 'express';
import cors from 'cors';
import { config } from './src/config/env.js';
import { connectDB, getDBStatus } from './src/config/db.js';
import llmRoutes from './src/routes/llmRoutes.js';
import logRoutes from './src/routes/logRoutes.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();

// Global Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Health and Diagnostics Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'LLM Safety Evaluation Service',
    database: dbStatus,
    activeModel: config.groqApiKey ? `Groq (${config.groqModel})` : config.geminiPrimaryModel
  });
});

// Mount Routes
app.use('/api/llm', llmRoutes);
app.use('/api/logs', logRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start Server
const PORT = config.port;
app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`[Server] LLM Safety Platform running on http://localhost:${PORT}`);
  console.log(`[Server] Model: ${config.geminiPrimaryModel} (Fallback: ${config.geminiFallbackModel})`);
  console.log(`=======================================================`);

  // Connect to Database
  await connectDB();
});
