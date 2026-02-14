require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Category = require('../lib/models/Category');

// 辅助函数：生成唯一slug
function generateSlug(text) {
  if (!text) return 'unknown';
  return text.toString()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'unknown';
}

async function importCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 清空现有数据
    await Category.deleteMany({});
    console.log('✅ Cleared existing categories');

    // 读取一级目录
    const level1Data = JSON.parse(await fs.readFile(path.join(__dirname, '../lib/seed/level1.json'), 'utf8'));
    const level1Map = {};
    level1Data.forEach(l1 => {
      level1Map[l1.name] = l1;
    });

    // 读取所有三级品类文件
    const level3Dir = path.join(__dirname, '../lib/seed/level3');
    const files = await fs.readdir(level3Dir);
    
    let totalCategories = 0;
    let errorCount = 0;
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      console.log(`\n📖 Reading ${file}...`);
      
      try {
        const fileContent = await fs.readFile(path.join(level3Dir, file), 'utf8');
        const data = JSON.parse(fileContent);
        
        const level1Name = data.level1;
        const level1 = level1Map[level1Name];
        
        if (!level1) {
          console.log(`⚠️  Level1 not found: ${level1Name}, skipping file`);
          continue;
        }
        
        if (!data.categories || !Array.isArray(data.categories)) {
          console.log(`⚠️  No categories array in ${file}, skipping`);
          continue;
        }
        
        for (const level2 of data.categories) {
          if (!level2 || !level2.name) {
            console.log(`⚠️  Invalid level2 in ${file}`);
            continue;
          }
          
          if (!level2.items || !Array.isArray(level2.items)) {
            console.log(`⚠️  No items in level2: ${level2.name}`);
            continue;
          }
          
          const level2Slug = generateSlug(level2.name);
          const level2Icon = level2.icon || 'fa-folder';
          
          for (const item of level2.items) {
            if (!item) continue;
            
            try {
              const category = {
                level1: {
                  name: level1.name,
                  slug: level1.slug,
                  icon: level1.icon,
                  region: level1.region
                },
                level2: {
                  name: level2.name,
                  slug: level2Slug,
                  icon: level2Icon
                },
                level3: {
                  name: item,
                  slug: `${level1.slug}-${level2Slug}-${generateSlug(item)}`,
                  dimensions: generateDimensions(item, level2.name),
                  priceRanges: generatePriceRanges(item, level2.name)
                }
              };
              
              await Category.create(category);
              totalCategories++;
              
              if (totalCategories % 100 === 0) {
                console.log(`📊 Imported ${totalCategories} categories...`);
              }
            } catch (itemError) {
              errorCount++;
              if (errorCount <= 10) {
                console.log(`⚠️  Error importing item "${item}": ${itemError.message}`);
              }
            }
          }
        }
      } catch (fileError) {
        console.log(`❌ Error processing file ${file}:`, fileError.message);
        errorCount++;
      }
    }
    
    console.log(`\n✅ Import completed!`);
    console.log(`📊 Total categories imported: ${totalCategories}`);
    if (errorCount > 0) {
      console.log(`⚠️  Errors encountered: ${errorCount}`);
    }
    
    // 统计
    const level1Count = await Category.distinct('level1.name').then(arr => arr.length);
    const level2Count = await Category.distinct('level2.name').then(arr => arr.length);
    const level3Count = await Category.countDocuments();
    
    console.log(`\n📊 Final Statistics:`);
    console.log(`   Level1: ${level1Count}`);
    console.log(`   Level2: ${level2Count}`);
    console.log(`   Level3: ${level3Count}`);
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

function generateDimensions(itemName, level2Name) {
  const dimensions = [
    { name: '质量最好', importance: 10 },
    { name: '性价比最高', importance: 9 },
    { name: '最耐用', importance: 8 }
  ];
  
  const itemStr = (itemName || '').toString();
  const level2Str = (level2Name || '').toString();
  
  if (itemStr.includes('螺丝') || itemStr.includes('螺栓') || level2Str.includes('紧固件')) {
    dimensions.push({ name: '强度最高', importance: 10 });
    dimensions.push({ name: '防锈最好', importance: 9 });
  } else if (itemStr.includes('工具') || level2Str.includes('工具')) {
    dimensions.push({ name: '最锋利', importance: 10 });
    dimensions.push({ name: '最顺手', importance: 9 });
  } else if (itemStr.includes('轴承')) {
    dimensions.push({ name: '精度最高', importance: 10 });
    dimensions.push({ name: '寿命最长', importance: 9 });
  } else if (itemStr.includes('阀门')) {
    dimensions.push({ name: '密封最好', importance: 10 });
    dimensions.push({ name: '耐压最高', importance: 9 });
  } else {
    dimensions.push({ name: '品牌最好', importance: 7 });
    dimensions.push({ name: '销量最好', importance: 6 });
  }
  
  return dimensions;
}

function generatePriceRanges(itemName, level2Name) {
  // 默认价格区间
  let ranges = [
    { name: '经济型', min: 0, max: 50 },
    { name: '标准型', min: 51, max: 200 },
    { name: '专业型', min: 201, max: 1000 },
    { name: '工业级', min: 1001, max: 999999 }
  ];
  
  const itemStr = (itemName || '').toString();
  
  // 根据品类调整价格区间
  if (itemStr.includes('轴承') || itemStr.includes('精密')) {
    ranges = [
      { name: '经济型', min: 0, max: 100 },
      { name: '标准型', min: 101, max: 500 },
      { name: '专业型', min: 501, max: 2000 },
      { name: '工业级', min: 2001, max: 999999 }
    ];
  } else if (itemStr.includes('电动工具') || itemStr.includes('电钻')) {
    ranges = [
      { name: '家用级', min: 0, max: 200 },
      { name: '专业级', min: 201, max: 800 },
      { name: '工业级', min: 801, max: 3000 },
      { name: '旗舰级', min: 3001, max: 999999 }
    ];
  } else if (itemStr.includes('微型') || itemStr.includes('小')) {
    ranges = [
      { name: '经济型', min: 0, max: 10 },
      { name: '标准型', min: 11, max: 50 },
      { name: '专业型', min: 51, max: 200 },
      { name: '工业级', min: 201, max: 999999 }
    ];
  }
  
  return ranges;
}

importCategories();
