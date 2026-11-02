import dotenv from 'dotenv';
dotenv.config({ override: true });

export const config = {
  get port() { return process.env.PORT || 5000; },
  get nodeEnv() { return process.env.NODE_ENV || 'development'; },
  get mongoUri() { return process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/llm_safety_boundaries'; },
  get groqApiKey() { 
    dotenv.config({ override: true });
    return (process.env.GROQ_API_KEY || '').trim(); 
  },
  get groqModel() { return process.env.GROQ_MODEL || 'openai/gpt-oss-120b'; },
  get geminiApiKey() { 
    dotenv.config({ override: true });
    return (process.env.GEMINI_API_KEY || '').trim(); 
  },
  get geminiPrimaryModel() { return process.env.GEMINI_PRIMARY_MODEL || 'gemini-3-flash-preview'; },
  get geminiFallbackModel() { return process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.5-flash'; }
};

