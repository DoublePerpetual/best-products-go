const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  level1: { type: String, required: true },
  level2: { type: String, required: true },
  level3: { type: String, required: true },
  dimension: { type: String, required: true },
  priceRange: {
    name: String,
    min: Number,
    max: Number
  },
  product: {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: String,
    price: {
      value: Number,
      currency: { type: String, default: 'CNY' }
    }
  },
  recommendation: {
    summary: String,
    detailed: String,
    pros: [String],
    cons: [String],
    highlights: [String],
    suitableFor: String,
    usage: String
  },
  evidence: {
    sources: [{
      name: String,
      score: String
    }],
    summary: String
  },
  region: { type: String, enum: ['global', 'china'], default: 'global' },
  aiGenerated: {
    isGenerated: { type: Boolean, default: true },
    provider: String,
    model: String,
    generatedAt: { type: Date, default: Date.now }
  }
}, {
  timestamps: true // 自动管理 createdAt 和 updatedAt
});

// 添加索引
AnswerSchema.index({ categoryId: 1, dimension: 1, 'priceRange.name': 1 }, { unique: true });

module.exports = mongoose.model('Answer', AnswerSchema);
