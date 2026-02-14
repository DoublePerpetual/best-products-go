require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../lib/models/Category');

// ========== 品类词库 ==========

// 一级大类（扩展到50个）
const level1Categories = [
  // 原20个保留
  { name: '数码电子', slug: 'digital-electronics', icon: 'fa-microchip', region: 'both' },
  { name: '服装鞋帽', slug: 'clothing', icon: 'fa-tshirt', region: 'both' },
  { name: '运动户外', slug: 'sports-outdoors', icon: 'fa-running', region: 'both' },
  { name: '美妆护肤', slug: 'beauty', icon: 'fa-spa', region: 'both' },
  { name: '食品饮料', slug: 'food-beverage', icon: 'fa-utensils', region: 'both' },
  { name: '家居用品', slug: 'home-living', icon: 'fa-home', region: 'both' },
  { name: '家装建材', slug: 'home-improvement', icon: 'fa-hammer', region: 'both' },
  { name: '母婴用品', slug: 'baby-mom', icon: 'fa-baby', region: 'both' },
  { name: '宠物用品', slug: 'pet-supplies', icon: 'fa-paw', region: 'both' },
  { name: '汽车用品', slug: 'auto-motive', icon: 'fa-car', region: 'both' },
  { name: '图书音像', slug: 'books-media', icon: 'fa-book', region: 'both' },
  { name: '办公用品', slug: 'office-supplies', icon: 'fa-pen', region: 'both' },
  { name: '乐器', slug: 'musical-instruments', icon: 'fa-guitar', region: 'both' },
  { name: '珠宝首饰', slug: 'jewelry', icon: 'fa-gem', region: 'both' },
  { name: '钟表眼镜', slug: 'watches-eyewear', icon: 'fa-clock', region: 'both' },
  { name: '箱包皮具', slug: 'bags-luggage', icon: 'fa-bag-shopping', region: 'both' },
  { name: '个护健康', slug: 'personal-care', icon: 'fa-heart-pulse', region: 'both' },
  { name: '成人情趣', slug: 'adult', icon: 'fa-heart', region: 'both' },
  { name: '礼品鲜花', slug: 'gifts-flowers', icon: 'fa-gift', region: 'both' },
  { name: '虚拟商品', slug: 'virtual-goods', icon: 'fa-cloud', region: 'global' },
  { name: '五金工具', slug: 'hardware-tools', icon: 'fa-tools', region: 'both' },
  { name: '五金配件', slug: 'hardware-parts', icon: 'fa-gear', region: 'both' },
  
  // 新增30个一级大类
  { name: '工业品', slug: 'industrial', icon: 'fa-industry', region: 'global' },
  { name: '医疗器械', slug: 'medical', icon: 'fa-hospital', region: 'global' },
  { name: '科学仪器', slug: 'scientific', icon: 'fa-flask', region: 'global' },
  { name: '农林牧渔', slug: 'agriculture', icon: 'fa-tree', region: 'global' },
  { name: '化工原料', slug: 'chemical', icon: 'fa-flask', region: 'global' },
  { name: '纺织皮革', slug: 'textile', icon: 'fa-thread', region: 'global' },
  { name: '包装印刷', slug: 'packaging', icon: 'fa-box', region: 'global' },
  { name: '安防设备', slug: 'security', icon: 'fa-shield', region: 'global' },
  { name: '消防器材', slug: 'firefighting', icon: 'fa-fire-extinguisher', region: 'global' },
  { name: '劳保用品', slug: 'safety', icon: 'fa-helmet-safety', region: 'global' },
  { name: '清洁用品', slug: 'cleaning', icon: 'fa-broom', region: 'both' },
  { name: '一次性用品', slug: 'disposable', icon: 'fa-trash', region: 'both' },
  { name: '酒店用品', slug: 'hotel', icon: 'fa-hotel', region: 'global' },
  { name: '餐饮设备', slug: 'catering', icon: 'fa-utensils', region: 'global' },
  { name: '超市设备', slug: 'supermarket', icon: 'fa-cart-shopping', region: 'global' },
  { name: '物流设备', slug: 'logistics', icon: 'fa-truck', region: 'global' },
  { name: '仓储设备', slug: 'warehouse', icon: 'fa-warehouse', region: 'global' },
  { name: '实验室设备', slug: 'laboratory', icon: 'fa-microscope', region: 'global' },
  { name: '教学设备', slug: 'education', icon: 'fa-chalkboard-user', region: 'global' },
  { name: '游乐设备', slug: 'amusement', icon: 'fa-gamepad', region: 'global' },
  { name: '健身器材', slug: 'fitness', icon: 'fa-dumbbell', region: 'both' },
  { name: '康复器材', slug: 'rehabilitation', icon: 'fa-wheelchair', region: 'global' },
  { name: '按摩器材', slug: 'massage', icon: 'fa-hand', region: 'both' },
  { name: '美容仪器', slug: 'beauty-devices', icon: 'fa-spa', region: 'both' },
  { name: '理发用品', slug: 'barber', icon: 'fa-scissors', region: 'both' },
  { name: '美甲用品', slug: 'nail', icon: 'fa-hand', region: 'both' },
  { name: '纹身用品', slug: 'tattoo', icon: 'fa-paintbrush', region: 'global' },
  { name: '宗教用品', slug: 'religious', icon: 'fa-church', region: 'global' },
  { name: '殡葬用品', slug: 'funeral', icon: 'fa-cross', region: 'global' },
  { name: '收藏品', slug: 'collectibles', icon: 'fa-star', region: 'global' }
];

// ========== 二级目录生成器 ==========

// 修饰词库（用于生成更多品类）
const prefixes = [
  '超薄', '加厚', '防水', '防尘', '防震', '防摔', '防锈', '防腐',
  '耐磨', '耐热', '耐寒', '耐压', '耐腐蚀', '耐酸碱', '耐高温', '耐低温',
  '轻便', '便携', '迷你', '小型', '中型', '大型', '超大型', '加长',
  '加宽', '加高', '加深', '浅口', '深口', '宽口', '窄口', '圆口',
  '方口', '尖头', '圆头', '平头', '六角', '八角', '十字', '一字',
  '专业', '家用', '商用', '工业', '医用', '军用', '户外', '室内',
  '电动', '手动', '气动', '液压', '智能', '自动', '半自动', '遥控',
  '无线', '有线', '蓝牙', 'WiFi', 'USB', 'Type-C', '充电', '电池'
];

const suffixes = [
  '款', '型', '版', '式', '系列', '等级', '规格', '型号',
  'A款', 'B款', 'C款', 'D款', 'E款', 'F款', 'G款', 'H款',
  '1号', '2号', '3号', '4号', '5号', '6号', '7号', '8号',
  '标准版', '升级版', '专业版', '旗舰版', '经济版', '豪华版', '尊享版', '定制版',
  '红色', '蓝色', '绿色', '黄色', '黑色', '白色', '灰色', '银色',
  '金色', '玫瑰金', '钛金色', '香槟金', '太空灰', '深空灰', '银灰色', '炭灰色'
];

// 材料词库
const materials = [
  '不锈钢', '碳钢', '合金钢', '铝合金', '钛合金', '铜', '黄铜', '青铜',
  '铁', '铸铁', '镀锌', '塑料', 'ABS', 'PVC', 'PE', 'PP',
  '尼龙', '橡胶', '硅胶', '皮革', 'PU', '真皮', '仿皮', '帆布',
  '棉', '麻', '丝', '羊毛', '化纤', '涤纶', '锦纶', '氨纶',
  '木头', '竹子', '藤条', '玻璃', '陶瓷', '水晶', '石材', '大理石'
];

// ========== 生成品类 ==========

function generateLevel2ForLevel1(level1Name) {
  const level2List = [];
  const count = Math.floor(Math.random() * 20) + 10; // 10-30个二级目录
  
  for (let i = 0; i < count; i++) {
    const name = generateLevel2Name(level1Name, i);
    level2List.push({
      name: name,
      slug: generateSlug(name),
      icon: getIconForLevel2(level1Name, name)
    });
  }
  
  return level2List;
}

function generateLevel2Name(level1Name, index) {
  const level2Types = {
    '数码电子': ['智能手机', '平板电脑', '笔记本电脑', '台式电脑', '显示器', '键盘', '鼠标', '耳机', '音响', '相机', '镜头', '无人机', '智能手表', '手环', 'VR设备', 'AR设备', '游戏机', '路由器', '交换机', 'NAS', '移动硬盘', 'U盘', '内存条', '固态硬盘', '显卡', '主板', 'CPU', '电源', '机箱', '散热器'],
    '服装鞋帽': ['T恤', '衬衫', '裤子', '裙子', '外套', '羽绒服', '棉服', '风衣', '大衣', '毛衣', '卫衣', '内衣', '内裤', '袜子', '鞋子', '运动鞋', '皮鞋', '休闲鞋', '靴子', '凉鞋', '拖鞋', '帽子', '手套', '围巾', '腰带', '领带', '泳装', '睡衣', '家居服', '瑜伽服'],
    '五金工具': ['螺丝刀', '扳手', '钳子', '锤子', '锯子', '锉刀', '电钻', '角磨机', '电锤', '电镐', '冲击钻', '手电钻', '螺丝', '螺母', '垫圈', '铆钉', '销', '挡圈', '轴承', '弹簧', '阀门', '管件', '接头', '法兰', '密封件', '液压工具', '气动工具', '电动工具', '手动工具', '测量工具']
  };
  
  const types = level2Types[level1Name] || ['通用' + (index + 1) + '型', '标准' + (index + 1) + '型', '专业' + (index + 1) + '型'];
  return types[index % types.length] + (index >= types.length ? ' ' + (Math.floor(index/types.length) + 1) : '');
}

function getIconForLevel2(level1Name, level2Name) {
  const iconMap = {
    '数码电子': 'fa-microchip',
    '服装鞋帽': 'fa-tshirt',
    '五金工具': 'fa-tools'
  };
  return iconMap[level1Name] || 'fa-folder';
}

function generateItemsForLevel2(level2Name, count = 50) {
  const items = [];
  const baseName = level2Name.replace(/[0-9]/g, '').trim();
  
  for (let i = 0; i < count; i++) {
    // 组合生成器
    const prefix = Math.random() > 0.3 ? prefixes[Math.floor(Math.random() * prefixes.length)] : '';
    const material = Math.random() > 0.5 ? materials[Math.floor(Math.random() * materials.length)] : '';
    const suffix = Math.random() > 0.4 ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';
    
    let item = '';
    if (prefix && material) {
      item = prefix + material + baseName;
    } else if (prefix) {
      item = prefix + baseName;
    } else if (material) {
      item = material + baseName;
    } else {
      item = baseName;
    }
    
    if (suffix) {
      item += suffix;
    }
    
    // 添加一些变体
    if (Math.random() > 0.7) {
      item += (Math.floor(Math.random() * 999) + 1);
    }
    
    items.push(item);
  }
  
  return [...new Set(items)]; // 去重
}

function generateSlug(text) {
  return text.toString()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'unknown';
}

function generateDimensions(itemName) {
  const dimensions = [
    { name: '质量最好', importance: 10 },
    { name: '性价比最高', importance: 9 },
    { name: '最耐用', importance: 8 }
  ];
  
  if (itemName.includes('螺丝') || itemName.includes('螺栓')) {
    dimensions.push({ name: '强度最高', importance: 10 });
    dimensions.push({ name: '防锈最好', importance: 9 });
  } else if (itemName.includes('工具')) {
    dimensions.push({ name: '最锋利', importance: 10 });
    dimensions.push({ name: '最顺手', importance: 9 });
  }
  
  return dimensions;
}

function generatePriceRanges(itemName) {
  return [
    { name: '经济型', min: 0, max: 50 },
    { name: '标准型', min: 51, max: 200 },
    { name: '专业型', min: 201, max: 1000 },
    { name: '工业级', min: 1001, max: 999999 }
  ];
}

// ========== 主生成函数 ==========

async function generateMassCategories(targetCount = 100000) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 获取现有品类数量
    const existingCount = await Category.countDocuments();
    console.log(`📊 当前品类数量: ${existingCount}`);
    console.log(`🎯 目标品类数量: ${targetCount}`);
    
    const needToGenerate = targetCount - existingCount;
    if (needToGenerate <= 0) {
      console.log('✅ 已达到目标数量');
      process.exit(0);
    }
    
    console.log(`📈 需要生成: ${needToGenerate} 个新品类`);
    
    let generated = 0;
    const batchSize = 1000;
    const usedNames = new Set();
    
    // 获取已存在的品类名
    const existing = await Category.find({}, { 'level3.name': 1 });
    existing.forEach(doc => usedNames.add(doc.level3.name));
    
    console.log(`📚 已存在 ${usedNames.size} 个品类名`);
    
    // 开始生成
    for (let i = 0; i < level1Categories.length && generated < needToGenerate; i++) {
      const level1 = level1Categories[i];
      const level2List = generateLevel2ForLevel1(level1.name);
      
      for (let j = 0; j < level2List.length && generated < needToGenerate; j++) {
        const level2 = level2List[j];
        const itemsPerLevel2 = Math.min(
          200, // 每个二级目录最多200个品类
          Math.ceil((needToGenerate - generated) / (level2List.length - j))
        );
        
        const items = generateItemsForLevel2(level2.name, itemsPerLevel2);
        
        for (const item of items) {
          if (usedNames.has(item)) continue; // 跳过已存在的
          if (generated >= needToGenerate) break;
          
          const category = {
            level1: {
              name: level1.name,
              slug: level1.slug,
              icon: level1.icon,
              region: level1.region
            },
            level2: {
              name: level2.name,
              slug: level2.slug,
              icon: level2.icon
            },
            level3: {
              name: item,
              slug: `${level1.slug}-${level2.slug}-${generateSlug(item)}`,
              dimensions: generateDimensions(item),
              priceRanges: generatePriceRanges(item)
            }
          };
          
          await Category.create(category);
          usedNames.add(item);
          generated++;
          
          if (generated % 1000 === 0) {
            console.log(`📊 已生成 ${generated}/${needToGenerate} 个新品类...`);
          }
        }
      }
    }
    
    const finalCount = await Category.countDocuments();
    console.log(`\n✅ 生成完成！`);
    console.log(`📊 最终品类总数: ${finalCount}`);
    console.log(`📊 新增品类: ${generated}`);
    
    // 统计
    const level1Count = await Category.distinct('level1.name').then(arr => arr.length);
    const level2Count = await Category.distinct('level2.name').then(arr => arr.length);
    
    console.log(`📊 Level1: ${level1Count}`);
    console.log(`📊 Level2: ${level2Count}`);
    console.log(`📊 Level3: ${finalCount}`);
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ 生成失败:', error);
    process.exit(1);
  }
}

// 获取命令行参数
const target = process.argv[2] ? parseInt(process.argv[2]) : 100000;
generateMassCategories(target);
