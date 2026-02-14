require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../lib/models/Category');

const categories = [
  // 数码电子类
  {
    level1: { name: '数码电子', slug: 'digital', icon: 'fa-microchip', region: 'both' },
    level2: { name: '智能手机', slug: 'smartphone', icon: 'fa-mobile-alt' },
    level3: {
      name: '5G手机',
      slug: '5g-smartphone',
      dimensions: [
        { name: '性能最强', importance: 10 },
        { name: '拍照最好', importance: 9 },
        { name: '续航最长', importance: 8 },
        { name: '屏幕最好', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '入门', min: 0, max: 1999 },
        { name: '中端', min: 2000, max: 3999 },
        { name: '高端', min: 4000, max: 5999 },
        { name: '旗舰', min: 6000, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '数码电子', slug: 'digital', icon: 'fa-microchip', region: 'both' },
    level2: { name: '智能手机', slug: 'smartphone', icon: 'fa-mobile-alt' },
    level3: {
      name: '游戏手机',
      slug: 'gaming-smartphone',
      dimensions: [
        { name: '性能最强', importance: 10 },
        { name: '散热最好', importance: 9 },
        { name: '屏幕刷新率最高', importance: 9 },
        { name: '续航最长', importance: 8 }
      ],
      priceRanges: [
        { name: '入门', min: 0, max: 1999 },
        { name: '中端', min: 2000, max: 3499 },
        { name: '高端', min: 3500, max: 4999 },
        { name: '旗舰', min: 5000, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '数码电子', slug: 'digital', icon: 'fa-microchip', region: 'both' },
    level2: { name: '智能手机', slug: 'smartphone', icon: 'fa-mobile-alt' },
    level3: {
      name: '折叠屏手机',
      slug: 'foldable-phone',
      dimensions: [
        { name: '铰链最好', importance: 10 },
        { name: '屏幕最好', importance: 9 },
        { name: '最轻薄', importance: 8 },
        { name: '续航最长', importance: 7 }
      ],
      priceRanges: [
        { name: '中端', min: 5000, max: 7999 },
        { name: '高端', min: 8000, max: 9999 },
        { name: '旗舰', min: 10000, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '数码电子', slug: 'digital', icon: 'fa-microchip', region: 'both' },
    level2: { name: '无线耳机', slug: 'wireless-earphone', icon: 'fa-headphones' },
    level3: {
      name: '降噪耳机',
      slug: 'noise-cancelling-earphone',
      dimensions: [
        { name: '降噪效果最好', importance: 10 },
        { name: '音质最好', importance: 9 },
        { name: '佩戴最舒适', importance: 8 },
        { name: '续航最长', importance: 7 }
      ],
      priceRanges: [
        { name: '入门', min: 0, max: 299 },
        { name: '中端', min: 300, max: 799 },
        { name: '高端', min: 800, max: 1499 },
        { name: '旗舰', min: 1500, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '数码电子', slug: 'digital', icon: 'fa-microchip', region: 'both' },
    level2: { name: '无线耳机', slug: 'wireless-earphone', icon: 'fa-headphones' },
    level3: {
      name: '运动耳机',
      slug: 'sports-earphone',
      dimensions: [
        { name: '佩戴最稳固', importance: 10 },
        { name: '防水最好', importance: 9 },
        { name: '续航最长', importance: 8 },
        { name: '音质最好', importance: 7 }
      ],
      priceRanges: [
        { name: '入门', min: 0, max: 199 },
        { name: '中端', min: 200, max: 499 },
        { name: '高端', min: 500, max: 999 },
        { name: '旗舰', min: 1000, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '数码电子', slug: 'digital', icon: 'fa-microchip', region: 'both' },
    level2: { name: '智能手表', slug: 'smartwatch', icon: 'fa-clock' },
    level3: {
      name: '运动智能手表',
      slug: 'sports-smartwatch',
      dimensions: [
        { name: '运动监测最准', importance: 10 },
        { name: '续航最长', importance: 9 },
        { name: '屏幕最好', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '入门', min: 0, max: 499 },
        { name: '中端', min: 500, max: 1499 },
        { name: '高端', min: 1500, max: 2999 },
        { name: '旗舰', min: 3000, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '数码电子', slug: 'digital', icon: 'fa-microchip', region: 'both' },
    level2: { name: '平板电脑', slug: 'tablet', icon: 'fa-tablet' },
    level3: {
      name: '影音平板',
      slug: 'media-tablet',
      dimensions: [
        { name: '屏幕最好', importance: 10 },
        { name: '音质最好', importance: 9 },
        { name: '续航最长', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '入门', min: 0, max: 999 },
        { name: '中端', min: 1000, max: 2499 },
        { name: '高端', min: 2500, max: 3999 },
        { name: '旗舰', min: 4000, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '数码电子', slug: 'digital', icon: 'fa-microchip', region: 'both' },
    level2: { name: '笔记本电脑', slug: 'laptop', icon: 'fa-laptop' },
    level3: {
      name: '轻薄本',
      slug: 'ultrabook',
      dimensions: [
        { name: '最轻薄', importance: 10 },
        { name: '续航最长', importance: 9 },
        { name: '性能最强', importance: 8 },
        { name: '屏幕最好', importance: 7 }
      ],
      priceRanges: [
        { name: '入门', min: 0, max: 3999 },
        { name: '中端', min: 4000, max: 5999 },
        { name: '高端', min: 6000, max: 8999 },
        { name: '旗舰', min: 9000, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '数码电子', slug: 'digital', icon: 'fa-microchip', region: 'both' },
    level2: { name: '笔记本电脑', slug: 'laptop', icon: 'fa-laptop' },
    level3: {
      name: '游戏本',
      slug: 'gaming-laptop',
      dimensions: [
        { name: '性能最强', importance: 10 },
        { name: '散热最好', importance: 9 },
        { name: '屏幕最好', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '入门', min: 0, max: 4999 },
        { name: '中端', min: 5000, max: 7999 },
        { name: '高端', min: 8000, max: 11999 },
        { name: '旗舰', min: 12000, max: 999999 }
      ]
    }
  },

  // 服装鞋帽类
  {
    level1: { name: '服装鞋帽', slug: 'clothing', icon: 'fa-tshirt', region: 'both' },
    level2: { name: '男士T恤', slug: 'mens-tshirt', icon: 'fa-male' },
    level3: {
      name: '纯棉T恤',
      slug: 'cotton-tshirt',
      dimensions: [
        { name: '面料最好', importance: 10 },
        { name: '版型最好', importance: 9 },
        { name: '最耐穿', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 99 },
        { name: '中端', min: 100, max: 299 },
        { name: '高端', min: 300, max: 599 },
        { name: '奢侈', min: 600, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '服装鞋帽', slug: 'clothing', icon: 'fa-tshirt', region: 'both' },
    level2: { name: '男士T恤', slug: 'mens-tshirt', icon: 'fa-male' },
    level3: {
      name: '速干T恤',
      slug: 'quick-dry-tshirt',
      dimensions: [
        { name: '速干效果最好', importance: 10 },
        { name: '透气最好', importance: 9 },
        { name: '最舒适', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 99 },
        { name: '中端', min: 100, max: 249 },
        { name: '高端', min: 250, max: 499 },
        { name: '奢侈', min: 500, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '服装鞋帽', slug: 'clothing', icon: 'fa-tshirt', region: 'both' },
    level2: { name: '男士衬衫', slug: 'mens-shirt', icon: 'fa-male' },
    level3: {
      name: '商务衬衫',
      slug: 'business-shirt',
      dimensions: [
        { name: '面料最好', importance: 10 },
        { name: '版型最好', importance: 9 },
        { name: '抗皱最好', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 199 },
        { name: '中端', min: 200, max: 499 },
        { name: '高端', min: 500, max: 999 },
        { name: '奢侈', min: 1000, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '服装鞋帽', slug: 'clothing', icon: 'fa-tshirt', region: 'both' },
    level2: { name: '男士内裤', slug: 'mens-underwear', icon: 'fa-male' },
    level3: {
      name: '平角内裤',
      slug: 'boxer-briefs',
      dimensions: [
        { name: '面料最好', importance: 10 },
        { name: '最舒适', importance: 9 },
        { name: '最耐穿', importance: 8 },
        { name: '透气最好', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 49 },
        { name: '中端', min: 50, max: 149 },
        { name: '高端', min: 150, max: 299 },
        { name: '奢侈', min: 300, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '服装鞋帽', slug: 'clothing', icon: 'fa-tshirt', region: 'both' },
    level2: { name: '女士内衣', slug: 'womens-underwear', icon: 'fa-female' },
    level3: {
      name: '无钢圈内衣',
      slug: 'wireless-bra',
      dimensions: [
        { name: '最舒适', importance: 10 },
        { name: '支撑最好', importance: 9 },
        { name: '面料最好', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 99 },
        { name: '中端', min: 100, max: 199 },
        { name: '高端', min: 200, max: 399 },
        { name: '奢侈', min: 400, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '服装鞋帽', slug: 'clothing', icon: 'fa-tshirt', region: 'both' },
    level2: { name: '丝袜', slug: 'pantyhose', icon: 'fa-female' },
    level3: {
      name: '超薄丝袜',
      slug: 'ultra-thin-pantyhose',
      dimensions: [
        { name: '最耐穿', importance: 10 },
        { name: '最舒适', importance: 9 },
        { name: '透明度最好', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 29 },
        { name: '中端', min: 30, max: 79 },
        { name: '高端', min: 80, max: 199 },
        { name: '奢侈', min: 200, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '服装鞋帽', slug: 'clothing', icon: 'fa-tshirt', region: 'both' },
    level2: { name: '牛仔裤', slug: 'jeans', icon: 'fa-male' },
    level3: {
      name: '修身牛仔裤',
      slug: 'slim-jeans',
      dimensions: [
        { name: '版型最好', importance: 10 },
        { name: '面料最好', importance: 9 },
        { name: '最耐穿', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 199 },
        { name: '中端', min: 200, max: 499 },
        { name: '高端', min: 500, max: 999 },
        { name: '奢侈', min: 1000, max: 999999 }
      ]
    }
  },

  // 运动户外类
  {
    level1: { name: '运动户外', slug: 'sports', icon: 'fa-running', region: 'both' },
    level2: { name: '跑鞋', slug: 'running-shoes', icon: 'fa-shoe-prints' },
    level3: {
      name: '缓震跑鞋',
      slug: 'cushioning-running-shoes',
      dimensions: [
        { name: '缓震最好', importance: 10 },
        { name: '最舒适', importance: 9 },
        { name: '最轻', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '入门', min: 0, max: 399 },
        { name: '中端', min: 400, max: 799 },
        { name: '高端', min: 800, max: 1299 },
        { name: '旗舰', min: 1300, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '运动户外', slug: 'sports', icon: 'fa-running', region: 'both' },
    level2: { name: '跑鞋', slug: 'running-shoes', icon: 'fa-shoe-prints' },
    level3: {
      name: '竞速跑鞋',
      slug: 'racing-shoes',
      dimensions: [
        { name: '最轻', importance: 10 },
        { name: '回弹最好', importance: 9 },
        { name: '推进力最强', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '入门', min: 0, max: 499 },
        { name: '中端', min: 500, max: 899 },
        { name: '高端', min: 900, max: 1499 },
        { name: '旗舰', min: 1500, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '运动户外', slug: 'sports', icon: 'fa-running', region: 'both' },
    level2: { name: '跑鞋', slug: 'running-shoes', icon: 'fa-shoe-prints' },
    level3: {
      name: '越野跑鞋',
      slug: 'trail-running-shoes',
      dimensions: [
        { name: '抓地最好', importance: 10 },
        { name: '保护最好', importance: 9 },
        { name: '最耐穿', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '入门', min: 0, max: 399 },
        { name: '中端', min: 400, max: 799 },
        { name: '高端', min: 800, max: 1299 },
        { name: '旗舰', min: 1300, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '运动户外', slug: 'sports', icon: 'fa-running', region: 'both' },
    level2: { name: '篮球鞋', slug: 'basketball-shoes', icon: 'fa-basketball' },
    level3: {
      name: '高帮篮球鞋',
      slug: 'high-top-basketball-shoes',
      dimensions: [
        { name: '缓震最好', importance: 10 },
        { name: '包裹最好', importance: 9 },
        { name: '防滑最好', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '入门', min: 0, max: 399 },
        { name: '中端', min: 400, max: 799 },
        { name: '高端', min: 800, max: 1199 },
        { name: '旗舰', min: 1200, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '运动户外', slug: 'sports', icon: 'fa-running', region: 'both' },
    level2: { name: '瑜伽垫', slug: 'yoga-mat', icon: 'fa-pray' },
    level3: {
      name: '防滑瑜伽垫',
      slug: 'anti-slip-yoga-mat',
      dimensions: [
        { name: '防滑最好', importance: 10 },
        { name: '最舒适', importance: 9 },
        { name: '最耐用', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 99 },
        { name: '中端', min: 100, max: 199 },
        { name: '高端', min: 200, max: 399 },
        { name: '奢侈', min: 400, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '运动户外', slug: 'sports', icon: 'fa-running', region: 'both' },
    level2: { name: '冲锋衣', slug: 'jacket', icon: 'fa-vest' },
    level3: {
      name: '三合一冲锋衣',
      slug: '3-in-1-jacket',
      dimensions: [
        { name: '防水最好', importance: 10 },
        { name: '透气最好', importance: 9 },
        { name: '保暖最好', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '入门', min: 0, max: 399 },
        { name: '中端', min: 400, max: 899 },
        { name: '高端', min: 900, max: 1499 },
        { name: '旗舰', min: 1500, max: 999999 }
      ]
    }
  },

  // 美妆护肤类
  {
    level1: { name: '美妆护肤', slug: 'beauty', icon: 'fa-spa', region: 'both' },
    level2: { name: '精华液', slug: 'serum', icon: 'fa-droplet' },
    level3: {
      name: '抗老精华',
      slug: 'anti-aging-serum',
      dimensions: [
        { name: '抗老效果最好', importance: 10 },
        { name: '吸收最快', importance: 9 },
        { name: '最温和', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 199 },
        { name: '中端', min: 200, max: 499 },
        { name: '高端', min: 500, max: 999 },
        { name: '奢侈', min: 1000, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '美妆护肤', slug: 'beauty', icon: 'fa-spa', region: 'both' },
    level2: { name: '精华液', slug: 'serum', icon: 'fa-droplet' },
    level3: {
      name: '美白精华',
      slug: 'whitening-serum',
      dimensions: [
        { name: '美白效果最好', importance: 10 },
        { name: '淡斑效果最好', importance: 9 },
        { name: '最温和', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 199 },
        { name: '中端', min: 200, max: 499 },
        { name: '高端', min: 500, max: 999 },
        { name: '奢侈', min: 1000, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '美妆护肤', slug: 'beauty', icon: 'fa-spa', region: 'both' },
    level2: { name: '面霜', slug: 'moisturizer', icon: 'fa-spa' },
    level3: {
      name: '保湿面霜',
      slug: 'hydrating-moisturizer',
      dimensions: [
        { name: '保湿最好', importance: 10 },
        { name: '吸收最快', importance: 9 },
        { name: '最温和', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 99 },
        { name: '中端', min: 100, max: 299 },
        { name: '高端', min: 300, max: 599 },
        { name: '奢侈', min: 600, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '美妆护肤', slug: 'beauty', icon: 'fa-spa', region: 'both' },
    level2: { name: '防晒', slug: 'sunscreen', icon: 'fa-sun' },
    level3: {
      name: '面部防晒',
      slug: 'face-sunscreen',
      dimensions: [
        { name: '防晒效果最好', importance: 10 },
        { name: '最清爽', importance: 9 },
        { name: '最温和', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 79 },
        { name: '中端', min: 80, max: 199 },
        { name: '高端', min: 200, max: 399 },
        { name: '奢侈', min: 400, max: 999999 }
      ]
    }
  },

  // 食品饮料类
  {
    level1: { name: '食品饮料', slug: 'food', icon: 'fa-utensils', region: 'both' },
    level2: { name: '保健品', slug: 'health-supplements', icon: 'fa-pills' },
    level3: {
      name: '鱼油',
      slug: 'fish-oil',
      dimensions: [
        { name: '纯度最高', importance: 10 },
        { name: '吸收最好', importance: 9 },
        { name: '性价比最高', importance: 8 },
        { name: '品牌最好', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 99 },
        { name: '中端', min: 100, max: 199 },
        { name: '高端', min: 200, max: 399 },
        { name: '奢侈', min: 400, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '食品饮料', slug: 'food', icon: 'fa-utensils', region: 'both' },
    level2: { name: '保健品', slug: 'health-supplements', icon: 'fa-pills' },
    level3: {
      name: '蛋白粉',
      slug: 'protein-powder',
      dimensions: [
        { name: '蛋白质含量最高', importance: 10 },
        { name: '吸收最好', importance: 9 },
        { name: '口味最好', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 199 },
        { name: '中端', min: 200, max: 399 },
        { name: '高端', min: 400, max: 599 },
        { name: '奢侈', min: 600, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '食品饮料', slug: 'food', icon: 'fa-utensils', region: 'both' },
    level2: { name: '咖啡', slug: 'coffee', icon: 'fa-mug-hot' },
    level3: {
      name: '挂耳咖啡',
      slug: 'drip-bag-coffee',
      dimensions: [
        { name: '风味最好', importance: 10 },
        { name: '性价比最高', importance: 9 },
        { name: '品牌最好', importance: 8 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 39 },
        { name: '中端', min: 40, max: 79 },
        { name: '高端', min: 80, max: 149 },
        { name: '奢侈', min: 150, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '食品饮料', slug: 'food', icon: 'fa-utensils', region: 'both' },
    level2: { name: '茶叶', slug: 'tea', icon: 'fa-leaf' },
    level3: {
      name: '龙井茶',
      slug: 'longjing-tea',
      dimensions: [
        { name: '品质最好', importance: 10 },
        { name: '性价比最高', importance: 9 },
        { name: '品牌最好', importance: 8 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 199 },
        { name: '中端', min: 200, max: 499 },
        { name: '高端', min: 500, max: 999 },
        { name: '奢侈', min: 1000, max: 999999 }
      ]
    }
  },

  // 家居用品类
  {
    level1: { name: '家居用品', slug: 'home', icon: 'fa-home', region: 'both' },
    level2: { name: '床上用品', slug: 'bedding', icon: 'fa-bed' },
    level3: {
      name: '羽绒被',
      slug: 'duvet',
      dimensions: [
        { name: '保暖最好', importance: 10 },
        { name: '最轻', importance: 9 },
        { name: '面料最好', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 499 },
        { name: '中端', min: 500, max: 999 },
        { name: '高端', min: 1000, max: 1999 },
        { name: '奢侈', min: 2000, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '家居用品', slug: 'home', icon: 'fa-home', region: 'both' },
    level2: { name: '床上用品', slug: 'bedding', icon: 'fa-bed' },
    level3: {
      name: '乳胶枕',
      slug: 'latex-pillow',
      dimensions: [
        { name: '支撑最好', importance: 10 },
        { name: '最舒适', importance: 9 },
        { name: '最耐用', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 199 },
        { name: '中端', min: 200, max: 399 },
        { name: '高端', min: 400, max: 599 },
        { name: '奢侈', min: 600, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '家居用品', slug: 'home', icon: 'fa-home', region: 'both' },
    level2: { name: '厨房用品', slug: 'kitchen', icon: 'fa-utensils' },
    level3: {
      name: '不粘锅',
      slug: 'nonstick-pan',
      dimensions: [
        { name: '不粘效果最好', importance: 10 },
        { name: '最耐用', importance: 9 },
        { name: '最轻', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 99 },
        { name: '中端', min: 100, max: 199 },
        { name: '高端', min: 200, max: 399 },
        { name: '奢侈', min: 400, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '家居用品', slug: 'home', icon: 'fa-home', region: 'both' },
    level2: { name: '清洁工具', slug: 'cleaning', icon: 'fa-broom' },
    level3: {
      name: '扫地机器人',
      slug: 'robot-vacuum',
      dimensions: [
        { name: '清洁效果最好', importance: 10 },
        { name: '智能最好', importance: 9 },
        { name: '续航最长', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '入门', min: 0, max: 999 },
        { name: '中端', min: 1000, max: 1999 },
        { name: '高端', min: 2000, max: 2999 },
        { name: '旗舰', min: 3000, max: 999999 }
      ]
    }
  },

  // 建材用品类
  {
    level1: { name: '建材用品', slug: 'building-materials', icon: 'fa-hammer', region: 'both' },
    level2: { name: '涂料', slug: 'paint', icon: 'fa-paint-brush' },
    level3: {
      name: '乳胶漆',
      slug: 'latex-paint',
      dimensions: [
        { name: '环保最好', importance: 10 },
        { name: '耐擦洗最好', importance: 9 },
        { name: '遮盖力最强', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 199 },
        { name: '中端', min: 200, max: 399 },
        { name: '高端', min: 400, max: 599 },
        { name: '奢侈', min: 600, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '建材用品', slug: 'building-materials', icon: 'fa-hammer', region: 'both' },
    level2: { name: '地板', slug: 'flooring', icon: 'fa-border-all' },
    level3: {
      name: '实木地板',
      slug: 'wood-flooring',
      dimensions: [
        { name: '质量最好', importance: 10 },
        { name: '最耐用', importance: 9 },
        { name: '性价比最高', importance: 8 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 199 },
        { name: '中端', min: 200, max: 399 },
        { name: '高端', min: 400, max: 599 },
        { name: '奢侈', min: 600, max: 999999 }
      ]
    }
  },

  // 情趣用品类
  {
    level1: { name: '情趣用品', slug: 'adult', icon: 'fa-heart', region: 'both' },
    level2: { name: '震动棒', slug: 'vibrator', icon: 'fa-bolt' },
    level3: {
      name: '无线震动棒',
      slug: 'wireless-vibrator',
      dimensions: [
        { name: '震动力度最强', importance: 10 },
        { name: '静音最好', importance: 9 },
        { name: '续航最长', importance: 8 },
        { name: '材质最好', importance: 7 }
      ],
      priceRanges: [
        { name: '入门', min: 0, max: 199 },
        { name: '中端', min: 200, max: 399 },
        { name: '高端', min: 400, max: 699 },
        { name: '奢侈', min: 700, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '情趣用品', slug: 'adult', icon: 'fa-heart', region: 'both' },
    level2: { name: '震动棒', slug: 'vibrator', icon: 'fa-bolt' },
    level3: {
      name: '迷你震动棒',
      slug: 'mini-vibrator',
      dimensions: [
        { name: '便携最好', importance: 10 },
        { name: '静音最好', importance: 9 },
        { name: '震动力度最强', importance: 8 }
      ],
      priceRanges: [
        { name: '入门', min: 0, max: 149 },
        { name: '中端', min: 150, max: 299 },
        { name: '高端', min: 300, max: 499 },
        { name: '奢侈', min: 500, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '情趣用品', slug: 'adult', icon: 'fa-heart', region: 'both' },
    level2: { name: '跳蛋', slug: 'egg-vibrator', icon: 'fa-circle' },
    level3: {
      name: '无线跳蛋',
      slug: 'wireless-egg-vibrator',
      dimensions: [
        { name: '震动力度最强', importance: 10 },
        { name: '静音最好', importance: 9 },
        { name: '防水最好', importance: 8 }
      ],
      priceRanges: [
        { name: '入门', min: 0, max: 99 },
        { name: '中端', min: 100, max: 199 },
        { name: '高端', min: 200, max: 299 },
        { name: '奢侈', min: 300, max: 999999 }
      ]
    }
  },
  {
    level1: { name: '情趣用品', slug: 'adult', icon: 'fa-heart', region: 'both' },
    level2: { name: '润滑液', slug: 'lubricant', icon: 'fa-droplet' },
    level3: {
      name: '水基润滑液',
      slug: 'water-based-lubricant',
      dimensions: [
        { name: '最顺滑', importance: 10 },
        { name: '最持久', importance: 9 },
        { name: '最温和', importance: 8 },
        { name: '性价比最高', importance: 7 }
      ],
      priceRanges: [
        { name: '平价', min: 0, max: 49 },
        { name: '中端', min: 50, max: 99 },
        { name: '高端', min: 100, max: 199 },
        { name: '奢侈', min: 200, max: 999999 }
      ]
    }
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Category.deleteMany({});
    console.log('Cleared existing categories');

    for (const cat of categories) {
      await Category.create(cat);
    }

    const count = await Category.countDocuments();
    console.log(`✅ Successfully seeded ${count} categories`);

    const level1s = await Category.distinct('level1.name');
    const level2s = await Category.distinct('level2.name');
    console.log(`📊 Level1: ${level1s.length}, Level2: ${level2s.length}, Level3: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
