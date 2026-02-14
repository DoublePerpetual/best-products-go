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

async function addSocks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 已连接数据库');
    
    // 获取服饰内衣的一级目录信息
    const sample = await Category.findOne({ 'level1.name': '服饰内衣' });
    if (!sample) {
      console.log('❌ 服饰内衣一级目录不存在，尝试创建...');
      // 如果没有，手动创建一级目录信息
      var level1 = {
        name: '服饰内衣',
        slug: 'clothing',
        icon: 'fa-tshirt',
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
    
    const socksData = [
      { level2: '男士袜子', items: [
        '男士商务袜', '男士运动袜', '男士休闲袜', '男士船袜', '男士中筒袜',
        '男士长筒袜', '男士短袜', '男士隐形袜', '男士羊毛袜', '男士棉袜',
        '男士绅士袜', '男士正装袜', '男士篮球袜', '男士登山袜', '男士功能袜'
      ]},
      { level2: '女士袜子', items: [
        '女士船袜', '女士短袜', '女士中筒袜', '女士长筒袜', '女士过膝袜',
        '女士隐形袜', '女士丝袜', '女士棉袜', '女士羊毛袜', '女士运动袜',
        '女士堆堆袜', '女士蕾丝袜', '女士网眼袜', '女士连裤袜', '女士及膝袜'
      ]},
      { level2: '功能袜', items: [
        '压力袜', '静脉曲张袜', '瘦腿袜', '运动压缩袜', '登山袜',
        '跑步袜', '篮球袜', '足球袜', '瑜伽袜', '舞蹈袜',
        '滑雪袜', '徒步袜', '骑行袜', '健身袜', '马拉松袜'
      ]},
      { level2: '材质袜', items: [
        '纯棉袜', '羊毛袜', '羊绒袜', '竹纤维袜', '真丝袜',
        '冰丝袜', '抗菌袜', '防臭袜', '吸汗袜', '发热袜',
        '精梳棉袜', '长绒棉袜', '美丽诺羊毛袜', '驼绒袜', '蚕丝袜'
      ]},
      { level2: '儿童袜', items: [
        '婴儿袜', '幼儿袜', '童袜', '宝宝袜', '新生儿袜',
        '儿童棉袜', '儿童羊毛袜', '儿童运动袜', '儿童短袜', '儿童中筒袜',
        '儿童长筒袜', '儿童防滑袜', '儿童地板袜', '儿童学步袜', '儿童连裤袜'
      ]}
    ];
    
    let added = 0;
    let skipped = 0;
    
    for (const sockGroup of socksData) {
      const level2Slug = generateSlug(sockGroup.level2);
      
      for (const item of sockGroup.items) {
        // 检查是否已存在
        const exists = await Category.findOne({ 'level3.name': item });
        if (exists) {
          skipped++;
          continue;
        }
        
        const itemSlug = generateSlug(item);
        const fullSlug = `${level1.slug}-${level2Slug}-${itemSlug}`;
        
        const category = {
          level1,
          level2: {
            name: sockGroup.level2,
            slug: level2Slug,
            icon: 'fa-socks'
          },
          level3: {
            name: item,
            slug: fullSlug,
            dimensions: [
              { name: '质量最好', importance: 10 },
              { name: '性价比最高', importance: 9 },
              { name: '最舒适', importance: 10 },
              { name: '最耐穿', importance: 9 },
              { name: '透气最好', importance: 8 },
              { name: '防臭最好', importance: 7 }
            ],
            priceRanges: [
              { name: '平价', min: 0, max: 19 },
              { name: '中端', min: 20, max: 49 },
              { name: '高端', min: 50, max: 99 },
              { name: '奢侈', min: 100, max: 999999 }
            ]
          }
        };
        
        try {
          await Category.create(category);
          added++;
          console.log(`✅ 添加: ${item}`);
        } catch (err) {
          if (err.code === 11000) {
            console.log(`⏭️ 跳过: ${item} (已存在)`);
            skipped++;
          } else {
            console.error(`❌ 错误: ${item}`, err.message);
          }
        }
      }
    }
    
    console.log(`\n完成: 新增 ${added} 个, 跳过 ${skipped} 个`);
    
    // 验证
    const socks = await Category.find({ 'level3.name': { $regex: '袜' } });
    console.log(`当前袜子品类总数: ${socks.length}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
  }
}

addSocks();
