require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../lib/models/Category');

const newCategories = {
  // 食品饮料 - 保健品子类
  '食品饮料': [
    {
      name: '保健品',
      icon: 'fa-pills',
      items: [
        '鱼油', '蛋白粉', '维生素C', '维生素B族', '维生素D',
        '钙片', '锌片', '铁剂', '益生菌', '胶原蛋白',
        '葡萄籽', '辅酶Q10', '护肝片', '褪黑素', '氨糖',
        '卵磷脂', '螺旋藻', '蜂胶', '蜂王浆', '大豆异黄酮',
        '叶酸', 'DHA', 'EPA', '番茄红素', '叶黄素'
      ]
    }
  ],
  
  // 袜子品类（多个分类下）
  '服饰内衣': [
    {
      name: '男士袜子',
      icon: 'fa-male',
      items: [
        '男士商务袜', '男士运动袜', '男士休闲袜', '男士船袜', '男士中筒袜',
        '男士长筒袜', '男士短袜', '男士隐形袜', '男士羊毛袜', '男士棉袜',
        '男士功能袜', '男士压力袜', '男士登山袜', '男士冬季袜', '男士夏季袜',
        '男士绅士袜', '男士正装袜', '男士休闲船袜', '男士运动短袜', '男士篮球袜'
      ]
    },
    {
      name: '女士袜子',
      icon: 'fa-female',
      items: [
        '女士船袜', '女士短袜', '女士中筒袜', '女士长筒袜', '女士过膝袜',
        '女士隐形袜', '女士丝袜', '女士棉袜', '女士羊毛袜', '女士运动袜',
        '女士堆堆袜', '女士蕾丝袜', '女士网眼袜', '女士冬季袜', '女士夏季袜',
        '女士连裤袜', '女士及膝袜', '女士小腿袜', '女士大腿袜', '女士及踝袜'
      ]
    },
    {
      name: '功能袜',
      icon: 'fa-socks',
      items: [
        '压力袜', '静脉曲张袜', '防静脉曲张袜', '瘦腿袜', '美腿袜',
        '运动压缩袜', '登山袜', '滑雪袜', '跑步袜', '篮球袜',
        '足球袜', '瑜伽袜', '舞蹈袜', '孕妇袜', '糖尿病人袜',
        '远红外袜', '磁疗袜', '保健袜', '抗菌袜', '防臭袜'
      ]
    },
    {
      name: '材质袜',
      icon: 'fa-tshirt',
      items: [
        '纯棉袜', '羊毛袜', '羊绒袜', '莫代尔袜', '竹纤维袜',
        '天丝袜', '真丝袜', '麻袜', '混纺袜', '发热袜',
        '冰丝袜', '透气袜', '抗菌袜', '防臭袜', '吸汗袜',
        '精梳棉袜', '长绒棉袜', '美丽诺羊毛袜', '驼绒袜', '蚕丝袜'
      ]
    },
    {
      name: '季节袜',
      icon: 'fa-cloud-sun',
      items: [
        '冬季保暖袜', '夏季薄款袜', '春秋款袜', '加厚袜', '薄款袜',
        '雪地袜', '毛圈袜', '珊瑚绒袜', '毛巾袜', '运动毛巾袜'
      ]
    }
  ],

  // 运动户外 - 增加运动袜
  '运动户外': [
    {
      name: '运动袜',
      icon: 'fa-running',
      items: [
        '跑步袜', '篮球袜', '足球袜', '网球袜', '羽毛球袜',
        '乒乓球袜', '排球袜', '健身袜', '瑜伽袜', '骑行袜',
        '登山袜', '徒步袜', '滑雪袜', '滑板袜', '舞蹈袜',
        '马拉松袜', '越野跑袜', '综训袜', 'CrossFit袜', '健身袜'
      ]
    }
  ],

  // 母婴用品 - 增加儿童袜
  '母婴用品': [
    {
      name: '儿童袜',
      icon: 'fa-baby',
      items: [
        '婴儿袜', '幼儿袜', '童袜', '宝宝袜', '新生儿袜',
        '儿童棉袜', '儿童羊毛袜', '儿童运动袜', '儿童短袜', '儿童中筒袜',
        '儿童长筒袜', '儿童船袜', '儿童防滑袜', '儿童地板袜', '儿童学步袜',
        '男童袜', '女童袜', '婴幼儿连裤袜', '儿童连裤袜', '儿童打底袜'
      ]
    }
  ]
};

async function addMoreCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已连接数据库');

    let added = 0;
    let skipped = 0;

    // 获取所有已存在的品类名
    const existingNames = new Set();
    const existing = await Category.find({}, { 'level3.name': 1 });
    existing.forEach(doc => existingNames.add(doc.level3.name));
    console.log(`📊 数据库中已有 ${existingNames.size} 个品类`);

    // 遍历新品类
    for (const [level1Name, level2List] of Object.entries(newCategories)) {
      console.log(`\n📦 处理一级目录: ${level1Name}`);
      
      // 获取一级目录信息
      const sample = await Category.findOne({ 'level1.name': level1Name });
      if (!sample) {
        console.log(`⚠️ 一级目录不存在: ${level1Name}`);
        continue;
      }

      const level1 = {
        name: sample.level1.name,
        slug: sample.level1.slug,
        icon: sample.level1.icon,
        region: sample.level1.region
      };

      for (const level2 of level2List) {
        let level2Added = 0;
        
        for (const item of level2.items) {
          if (existingNames.has(item)) {
            skipped++;
            continue;
          }

          const category = {
            level1,
            level2: {
              name: level2.name,
              slug: level2.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              icon: level2.icon
            },
            level3: {
              name: item,
              slug: `${level1.slug}-${level2.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${item.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              dimensions: generateDimensions(item),
              priceRanges: generatePriceRanges(item)
            }
          };

          try {
            await Category.create(category);
            existingNames.add(item);
            added++;
            level2Added++;
            
            if (added % 20 === 0) {
              console.log(`📊 已添加 ${added} 个新品类...`);
            }
          } catch (err) {
            if (err.code === 11000) {
              skipped++;
            } else {
              console.log(`❌ 添加失败 ${item}:`, err.message);
            }
          }
        }
        
        console.log(`   ${level2.name}: 新增 ${level2Added} 个`);
      }
    }

    console.log(`\n✅ 添加完成！`);
    console.log(`  新增: ${added} 个`);
    console.log(`  跳过: ${skipped} 个（已存在）`);
    
    // 验证袜子品类
    const socks = await Category.find({ 'level3.name': { $regex: '袜' } });
    console.log(`\n🧦 当前袜子品类总数: ${socks.length}`);
    
    // 按一级目录统计袜子
    const socksByLevel1 = {};
    socks.forEach(s => {
      const l1 = s.level1.name;
      socksByLevel1[l1] = (socksByLevel1[l1] || 0) + 1;
    });
    console.log('袜子分布:');
    Object.entries(socksByLevel1).forEach(([l1, count]) => {
      console.log(`   ${l1}: ${count}个`);
    });

    const total = await Category.countDocuments();
    console.log(`\n📊 当前总品类数: ${total}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 添加失败:', error);
  }
}

function generateDimensions(itemName) {
  const dimensions = [
    { name: '质量最好', importance: 10 },
    { name: '性价比最高', importance: 9 },
    { name: '最耐用', importance: 8 }
  ];

  if (itemName.includes('袜')) {
    dimensions.push({ name: '最舒适', importance: 10 });
    dimensions.push({ name: '最耐穿', importance: 9 });
    dimensions.push({ name: '透气最好', importance: 8 });
    dimensions.push({ name: '防臭最好', importance: 7 });
  } else if (itemName.includes('鱼油') || itemName.includes('蛋白粉') || itemName.includes('维生素')) {
    dimensions.push({ name: '纯度最高', importance: 10 });
    dimensions.push({ name: '吸收最好', importance: 9 });
    dimensions.push({ name: '品牌最好', importance: 8 });
  }

  return dimensions;
}

function generatePriceRanges(itemName) {
  if (itemName.includes('袜')) {
    return [
      { name: '平价', min: 0, max: 19 },
      { name: '中端', min: 20, max: 49 },
      { name: '高端', min: 50, max: 99 },
      { name: '奢侈', min: 100, max: 999999 }
    ];
  } else if (itemName.includes('鱼油') || itemName.includes('保健品')) {
    return [
      { name: '入门', min: 0, max: 99 },
      { name: '中端', min: 100, max: 199 },
      { name: '高端', min: 200, max: 399 },
      { name: '奢侈', min: 400, max: 999999 }
    ];
  }

  return [
    { name: '入门', min: 0, max: 99 },
    { name: '中端', min: 100, max: 299 },
    { name: '高端', min: 300, max: 599 },
    { name: '奢侈', min: 600, max: 999999 }
  ];
}

addMoreCategories();
