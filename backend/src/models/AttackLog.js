import mongoose from 'mongoose';

const SafetyRatingSchema = new mongoose.Schema({
  category: { type: String, required: true },
  probability: { type: String, default: 'NEGLIGIBLE' },
  severity: { type: String, default: 'LOW' }
}, { _id: false });

const AttackLogSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
    trim: true
  },
  attackLabel: {
    type: String,
    default: 'Manual Command'
  },
  category: {
    type: String,
    enum: [
      'DAN_JAILBREAK',
      'ROLEPLAY_BYPASS',
      'MALICIOUS_COMMAND',
      'BASE64_OBFUSCATION',
      'SAFE_BASELINE',
      'CUSTOM_PROMPT'
    ],
    default: 'CUSTOM_PROMPT'
  },
  isWrongCommand: {
    type: Boolean,
    default: true
  },
  response: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['REFUSED', 'BYPASSED', 'SAFE_RESPONSE', 'ERROR'],
    required: true
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  safetyRatings: [SafetyRatingSchema],
  finishReason: {
    type: String,
    default: 'STOP'
  },
  modelUsed: {
    type: String,
    default: 'gemini-3.5-flash'
  },
  latencyMs: {
    type: Number,
    default: 0
  },
  isGrounded: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const AttackLog = mongoose.model('AttackLog', AttackLogSchema);
