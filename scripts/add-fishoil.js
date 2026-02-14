const mongoose = require('mongoose');
const Category = require('../lib/models/Category');
require('dotenv').config();

// 辅助函数：生成slug
function generateSlug(text) {
  if (!text) return 'unknown';
  return text.toString()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'unknown';
}

async function addFishOil() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已连接数据库');
    
    // 获取食品饮料的一级目录信息
    const sample = await Category.findOne({ 'level1.name': '食品饮料' });
    if (!sample) {
      console.log('❌ 食品饮料一级目录不存在，尝试创建...');
      // 如果没有，手动创建一级目录信息
      var level1 = {
        name: '食品饮料',
        slug: 'food-beverage',
        icon: 'fa-utensils',
        region: 'both'
      };
    } else {
      var level1 = {
        name: sample.level1.name,
        slug: sample.level1.slug,
        icon: sample.level1.icon,
        region: sample.level1.region
      };
    }
    
    const fishOilExists = await Category.findOne({ 'level3.name': '鱼油' });
    if (!fishOilExists) {
      const level2Slug = generateSlug('保健品');
      const itemSlug = generateSlug('鱼油');
      const fullSlug = `${level1.slug}-${level2Slug}-${itemSlug}`;
      
      const category = {
        level1,
        level2: {
          name: '保健品',
          slug: level2Slug,
          icon: 'fa-pills'
        },
        level3: {
          name: '鱼油',
          slug: fullSlug,
          dimensions: [
            { name: '质量最好', importance: 10 },
            { name: '纯度最高', importance: 10 },
            { name: '吸收最好', importance: 9 },
            { name: '性价比最高', importance: 8 },
            { name: '品牌最好', importance: 7 }
          ],
          priceRanges: [
            { name: '入门', min: 0, max: 99 },
            { name: '中端', min: 100, max: 199 },
            { name: '高端', min: 200, max: 399 },
            { name: '奢侈', min: 400, max: 999999 }
          ]
        }
      };
      
      await Category.create(category);
      console.log('✅ 添加: 鱼油');
    } else {
      console.log('⏭️ 鱼油已存在');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
  }
}

addFishOil();
