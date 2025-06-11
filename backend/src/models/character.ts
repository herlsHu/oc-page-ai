import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema({
  // 基本
  avatar: { type: String }, // URL to avatar image
  voice: { type: String }, // URL to voice file
  language: { type: String, required: true },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  otherGender: { type: String },
  age: { type: String },
  birthday: { type: String },
  mbti: { type: String },
  otherMbti: { type: String },
  stance: { type: String },
  otherStance: { type: String },

  // 核心必填
  personality: { type: String, required: true },
  appearance: { type: String, required: true },

  // 高级
  world: { type: String },
  identity: { type: String },
  supplemental: { type: String },
  userRelation: { type: String },

  // 语言习惯
  addressUser: { type: String },
  greeting: { type: String },
  catchphrase: { type: String },
  examples: [{ type: String }],

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
characterSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Character = mongoose.model('Character', characterSchema); 