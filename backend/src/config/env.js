import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/llm_safety_boundaries',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiPrimaryModel: process.env.GEMINI_PRIMARY_MODEL || 'gemini-3.5-flash',
  geminiFallbackModel: process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash-lite'
};
