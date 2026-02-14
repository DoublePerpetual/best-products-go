const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  level1: {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true },
    icon: { type: String, default: 'fa-box' },
    region: { type: String, enum: ['global', 'china', 'both'], default: 'both' }
  },
  level2: {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    icon: { type: String, default: 'fa-folder' }
  },
  level3: {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    dimensions: [{
      name: String,
      description: String,
      importance: Number
    }],
    priceRanges: [{
      name: String,
      min: Number,
      max: Number,
      unit: { type: String, default: 'CNY' }
    }]
  },
  metadata: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    source: { type: String, default: 'manual' }
  }
});

CategorySchema.index({ 'level1.name': 1, 'level2.name': 1, 'level3.name': 1 });
CategorySchema.index({ 'level3.slug': 1 });

module.exports = mongoose.model('Category', CategorySchema);
