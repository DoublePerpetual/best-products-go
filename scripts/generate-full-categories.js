require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../lib/models/Category');

// 完整的一级目录（共20个大类）
const level1Categories = [
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
  { name: '虚拟商品', slug: 'virtual-goods', icon: 'fa-cloud', region: 'global' }
];

// 二级目录和三级品类数据
function generateCategories() {
  const categories = [];
  const usedSlugs = new Set(); // 用于跟踪已使用的slug

  // 辅助函数：生成唯一slug
  function generateUniqueSlug(name, level1Name, level2Name) {
    // 基础slug：移除特殊字符，转小写，用连字符连接
    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-') // 保留中文
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // 如果slug太短，添加一些标识
    if (baseSlug.length < 3) {
      baseSlug = `${level1Name}-${level2Name}-${baseSlug}`.toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    let slug = baseSlug;
    let counter = 1;
    
    // 如果slug已存在，添加数字后缀
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    usedSlugs.add(slug);
    return slug;
  }

  // 1. 数码电子
  const digitalLevel2 = [
    {
      name: '智能手机',
      slug: 'smartphones',
      icon: 'fa-mobile-alt',
      items: [
        '5G手机', '游戏手机', '拍照手机', '折叠屏手机', '老年机',
        '三防手机', '商务手机', '女性手机', '长续航手机', '小屏手机',
        '快充手机', '学生手机', '备用机', '双卡手机', '卫星通信手机'
      ]
    },
    {
      name: '无线耳机',
      slug: 'wireless-earphones',
      icon: 'fa-headphones',
      items: [
        '降噪耳机', '运动耳机', '真无线耳机', '骨传导耳机', '头戴式耳机',
        '游戏耳机', '蓝牙耳机', '挂耳式耳机', '入耳式耳机', '半入耳式耳机',
        '主动降噪耳机', '被动降噪耳机', '开放式耳机', '监听耳机', 'HiFi耳机'
      ]
    },
    {
      name: '智能手表',
      slug: 'smartwatches',
      icon: 'fa-clock',
      items: [
        '运动智能手表', '健康监测手表', '儿童电话手表', '商务智能手表',
        '户外智能手表', '游泳手表', 'GPS手表', '心率监测手表', '血氧监测手表',
        '睡眠监测手表', '女性生理周期手表', '长续航手表', '独立通话手表',
        '音乐手表', '支付手表'
      ]
    },
    {
      name: '平板电脑',
      slug: 'tablets',
      icon: 'fa-tablet',
      items: [
        '影音平板', '学习平板', '游戏平板', '商务平板', '绘图平板',
        '5G平板', '二合一平板', '儿童平板', '老人平板', '户外平板',
        '高刷平板', 'OLED平板', '手写平板', '键盘平板', 'Windows平板'
      ]
    },
    {
      name: '笔记本电脑',
      slug: 'laptops',
      icon: 'fa-laptop',
      items: [
        '轻薄本', '游戏本', '商务本', '二合一笔记本', '全能本',
        '创作本', '学生本', '上网本', '移动工作站', '超极本',
        'OLED笔记本', '触控笔记本', '防窥笔记本', '军工笔记本', 'Linux笔记本'
      ]
    },
    {
      name: '台式电脑',
      slug: 'desktops',
      icon: 'fa-computer',
      items: [
        '游戏台式机', '办公台式机', '一体机', '迷你主机', '工作站',
        '设计电脑', '家用电脑', '网吧电脑', '服务器', 'HTPC',
        '组装电脑', '品牌机', '静音电脑', '水冷电脑', '双屏电脑'
      ]
    },
    {
      name: '显示器',
      slug: 'monitors',
      icon: 'fa-tv',
      items: [
        '电竞显示器', '设计显示器', '办公显示器', '带鱼屏', '4K显示器',
        '高刷显示器', '曲面显示器', '便携显示器', '触摸显示器', '专业显示器',
        '护眼显示器', 'HDR显示器', 'miniLED显示器', 'OLED显示器', '竖屏显示器'
      ]
    },
    {
      name: '键盘鼠标',
      slug: 'keyboard-mouse',
      icon: 'fa-keyboard',
      items: [
        '机械键盘', '游戏鼠标', '无线键鼠', '人体工学键盘', '静音鼠标',
        '蓝牙键盘', '双模鼠标', 'RGB键盘', '轻量化鼠标', '编程键盘',
        '客制化键盘', '轨迹球鼠标', '垂直鼠标', '剪刀脚键盘', '折叠键盘'
      ]
    },
    {
      name: '相机',
      slug: 'cameras',
      icon: 'fa-camera',
      items: [
        '微单相机', '单反相机', '卡片相机', '拍立得', '运动相机',
        '全景相机', '无人机', '云台相机', '胶片相机', '旁轴相机',
        '中画幅相机', '水下相机', '红外相机', '天文相机', '监控相机'
      ]
    },
    {
      name: '镜头',
      slug: 'lenses',
      icon: 'fa-camera-retro',
      items: [
        '标准镜头', '广角镜头', '长焦镜头', '微距镜头', '鱼眼镜头',
        '人像镜头', '风光镜头', '打鸟镜头', '移轴镜头', '电影镜头',
        '转接环', '增距镜', '折返镜头', '手动镜头', '自动镜头'
      ]
    },
    {
      name: '智能家居',
      slug: 'smart-home',
      icon: 'fa-house-circle',
      items: [
        '智能音箱', '智能插座', '智能灯泡', '智能门锁', '智能摄像头',
        '智能窗帘', '智能传感器', '智能网关', '智能遥控', '智能家电',
        '扫地机器人', '智能猫眼', '智能门铃', '智能面板', '智能中控'
      ]
    },
    {
      name: '路由器',
      slug: 'routers',
      icon: 'fa-wifi',
      items: [
        '家用路由器', '游戏路由器', 'Mesh路由器', '企业路由器', '便携路由器',
        'WiFi6路由器', 'WiFi7路由器', '5G CPE', '有线路由器', '软路由',
        '双频路由器', '三频路由器', '穿墙路由器', 'USB路由器', '4G路由器'
      ]
    },
    {
      name: '存储设备',
      slug: 'storage',
      icon: 'fa-database',
      items: [
        '移动硬盘', 'U盘', '固态硬盘', '机械硬盘', 'NAS',
        '内存卡', '硬盘盒', '磁盘阵列', '企业硬盘', '监控硬盘',
        '加密U盘', '高速U盘', 'Type-C硬盘', '指纹硬盘', '无线硬盘'
      ]
    },
    {
      name: '游戏设备',
      slug: 'gaming',
      icon: 'fa-gamepad',
      items: [
        '游戏手柄', '游戏方向盘', '游戏摇杆', 'VR眼镜', '游戏耳机',
        '游戏键盘', '游戏鼠标', '游戏显示器', '游戏主机', '游戏显卡',
        '游戏加速器', '游戏座椅', '游戏麦克风', '游戏摄像头', '游戏手台'
      ]
    },
    {
      name: '影音娱乐',
      slug: 'audio-video',
      icon: 'fa-music',
      items: [
        '蓝牙音箱', '家庭影院', '回音壁', 'CD机', '黑胶唱机',
        '收音机', '录音笔', '麦克风', '声卡', '调音台',
        '功放', '解码器', '耳放', '音箱', '低音炮'
      ]
    }
  ];

  // 2. 服装鞋帽
  const clothingLevel2 = [
    {
      name: '男士T恤',
      slug: 'mens-tshirts',
      icon: 'fa-male',
      items: [
        '纯棉T恤', '速干T恤', '印花T恤', '纯色T恤', '长袖T恤',
        '短袖T恤', 'POLO衫', '亨利衫', '打底衫', '文化衫',
        '重磅T恤', '轻薄T恤', '抗菌T恤', '抗UVT恤', '冰感T恤'
      ]
    },
    {
      name: '男士衬衫',
      slug: 'mens-shirts',
      icon: 'fa-male',
      items: [
        '商务衬衫', '休闲衬衫', '牛仔衬衫', '格子衬衫', '纯色衬衫',
        '长袖衬衫', '短袖衬衫', '牛津纺衬衫', '府绸衬衫', '亚麻衬衫',
        '免烫衬衫', '法式衬衫', '工装衬衫', '印花衬衫', '拼接衬衫'
      ]
    },
    {
      name: '男士裤装',
      slug: 'mens-pants',
      icon: 'fa-male',
      items: [
        '休闲裤', '西裤', '牛仔裤', '运动裤', '短裤',
        '工装裤', '束脚裤', '阔腿裤', '哈伦裤', '背带裤',
        '棉麻裤', '卫裤', '冲锋裤', '压缩裤', '泳裤'
      ]
    },
    {
      name: '男士内裤',
      slug: 'mens-underwear',
      icon: 'fa-male',
      items: [
        '平角内裤', '三角内裤', '莫代尔内裤', '纯棉内裤', '冰丝内裤',
        '男士丁字裤', '提臀内裤', '抗菌内裤', '高腰内裤', '低腰内裤',
        '无痕内裤', '运动内裤', '保暖内裤', '蚕丝内裤', '竹纤维内裤'
      ]
    },
    {
      name: '男士外套',
      slug: 'mens-outerwear',
      icon: 'fa-male',
      items: [
        '夹克', '风衣', '棉服', '羽绒服', '冲锋衣',
        '皮衣', '西装', '马甲', '卫衣', '棒球服',
        '猎装', '派克服', '飞行员夹克', '牛仔外套', '工装外套'
      ]
    },
    {
      name: '男士鞋类',
      slug: 'mens-shoes',
      icon: 'fa-male',
      items: [
        '运动鞋', '皮鞋', '休闲鞋', '凉鞋', '拖鞋',
        '靴子', '板鞋', '帆布鞋', '豆豆鞋', '乐福鞋',
        '德比鞋', '牛津鞋', '孟克鞋', '切尔西靴', '马丁靴'
      ]
    },
    {
      name: '女士T恤',
      slug: 'womens-tshirts',
      icon: 'fa-female',
      items: [
        '纯棉T恤', '修身T恤', '宽松T恤', '印花T恤', '露肩T恤',
        '长袖T恤', '短袖T恤', '蕾丝T恤', '雪纺T恤', '针织T恤',
        '条纹T恤', '字母T恤', '卡通T恤', '情侣T恤', '闺蜜T恤'
      ]
    },
    {
      name: '女士衬衫',
      slug: 'womens-shirts',
      icon: 'fa-female',
      items: [
        '雪纺衬衫', '真丝衬衫', '棉质衬衫', '牛仔衬衫', 'OL衬衫',
        '长袖衬衫', '短袖衬衫', '荷叶边衬衫', '飘带衬衫', '蕾丝衬衫',
        '泡泡袖衬衫', '法式衬衫', '印花衬衫', '纯色衬衫', '条纹衬衫'
      ]
    },
    {
      name: '女士裤装',
      slug: 'womens-pants',
      icon: 'fa-female',
      items: [
        '牛仔裤', '休闲裤', '西装裤', '阔腿裤', '紧身裤',
        '运动裤', '短裤', '背带裤', '哈伦裤', '喇叭裤',
        '烟管裤', '纸袋裤', '工装裤', '骑行裤', '瑜伽裤'
      ]
    },
    {
      name: '裙子',
      slug: 'dresses',
      icon: 'fa-female',
      items: [
        '连衣裙', '半身裙', '长裙', '短裙', 'A字裙',
        '包臀裙', '百褶裙', '吊带裙', '衬衫裙', '牛仔裙',
        '蕾丝裙', '雪纺裙', '针织裙', '缎面裙', '纱裙'
      ]
    },
    {
      name: '女士内衣',
      slug: 'womens-underwear',
      icon: 'fa-female',
      items: [
        '文胸', '内裤', '塑身衣', '睡衣', '家居服',
        '运动内衣', '哺乳内衣', '无钢圈内衣', '聚拢内衣', '调整型内衣',
        '蕾丝内衣', '纯棉内衣', '莫代尔内衣', '真丝睡衣', '睡裙'
      ]
    },
    {
      name: '丝袜',
      slug: 'pantyhose',
      icon: 'fa-female',
      items: [
        '超薄丝袜', '天鹅绒丝袜', '包芯丝丝袜', '连裤袜', '过膝袜',
        '中筒袜', '船袜', '压力袜', '美腿袜', '蕾丝丝袜',
        '渔网袜', '吊带袜', '运动袜', '纯棉袜', '羊毛袜'
      ]
    },
    {
      name: '女士外套',
      slug: 'womens-outerwear',
      icon: 'fa-female',
      items: [
        '大衣', '羽绒服', '棉服', '风衣', '皮草',
        '夹克', '西装', '卫衣', '开衫', '披肩',
        '斗篷', '马甲', '牛仔外套', '皮衣', '派克服'
      ]
    },
    {
      name: '女士鞋类',
      slug: 'womens-shoes',
      icon: 'fa-female',
      items: [
        '高跟鞋', '平底鞋', '运动鞋', '靴子', '凉鞋',
        '拖鞋', '帆布鞋', '乐福鞋', '玛丽珍鞋', '穆勒鞋',
        '豆豆鞋', '雪地靴', '切尔西靴', '过膝靴', '马丁靴'
      ]
    }
  ];

  // 3. 运动户外
  const sportsLevel2 = [
    {
      name: '跑鞋',
      slug: 'running-shoes',
      icon: 'fa-shoe-prints',
      items: [
        '缓震跑鞋', '竞速跑鞋', '越野跑鞋', '日常训练鞋', '马拉松跑鞋',
        '赤足跑鞋', '稳定支撑跑鞋', '轻量跑鞋', '登山跑鞋', '跑步机跑鞋',
        '夜光跑鞋', '防水跑鞋', '碳板跑鞋', '气垫跑鞋', '赤足跑鞋'
      ]
    },
    {
      name: '篮球鞋',
      slug: 'basketball-shoes',
      icon: 'fa-basketball',
      items: [
        '高帮篮球鞋', '低帮篮球鞋', '中帮篮球鞋', '实战篮球鞋', '签名球鞋',
        '后卫鞋', '前锋鞋', '中锋鞋', '室内篮球鞋', '室外篮球鞋',
        '耐磨篮球鞋', '轻量篮球鞋', '缓震篮球鞋', '包裹篮球鞋', '防侧翻篮球鞋'
      ]
    },
    {
      name: '足球鞋',
      slug: 'soccer-shoes',
      icon: 'fa-futbol',
      items: [
        'FG足球鞋', 'AG足球鞋', 'TF足球鞋', 'IC足球鞋', 'MG足球鞋',
        'SG足球鞋', '儿童足球鞋', '人造草足球鞋', '天然草足球鞋', '室内足球鞋',
        '速度型足球鞋', '掌控型足球鞋', '力量型足球鞋', '袋鼠皮足球鞋', '超纤足球鞋'
      ]
    },
    {
      name: '运动服装',
      slug: 'activewear',
      icon: 'fa-shirt',
      items: [
        '运动T恤', '运动背心', '运动裤', '瑜伽裤', '压缩衣',
        '运动外套', '运动卫衣', '运动内衣', '运动袜', '运动帽',
        '排汗衣', '保暖衣', '防晒衣', '风衣', '雨衣'
      ]
    },
    {
      name: '户外服装',
      slug: 'outdoor-clothing',
      icon: 'fa-vest',
      items: [
        '冲锋衣', '抓绒衣', '软壳衣', '羽绒服', '速干衣',
        '户外裤', '户外内衣', '防晒衣', '防风衣', '防雨衣',
        '登山服', '滑雪服', '骑行服', '钓鱼服', '狩猎服'
      ]
    },
    {
      name: '户外鞋',
      slug: 'outdoor-shoes',
      icon: 'fa-hiking',
      items: [
        '登山鞋', '徒步鞋', '溯溪鞋', '攀岩鞋', '越野鞋',
        '雪地靴', '沙漠靴', '战术靴', '工作靴', '防水鞋',
        '防滑鞋', '保暖鞋', '透气鞋', '轻量鞋', '高帮鞋'
      ]
    },
    {
      name: '露营装备',
      slug: 'camping',
      icon: 'fa-campground',
      items: [
        '帐篷', '睡袋', '防潮垫', '露营灯', '露营椅',
        '露营桌', '野餐垫', '天幕', '炉头', '气罐',
        '炊具', '水壶', '营地车', '露营包', '急救包'
      ]
    },
    {
      name: '登山装备',
      slug: 'mountaineering',
      icon: 'fa-mountain',
      items: [
        '登山杖', '登山包', '头灯', '护膝', '冰爪',
        '冰镐', '安全带', '主锁', '扁带', '下降器',
        '上升器', '头盔', '雪镜', '氧气瓶', 'GPS'
      ]
    },
    {
      name: '骑行装备',
      slug: 'cycling',
      icon: 'fa-bicycle',
      items: [
        '自行车', '骑行服', '骑行裤', '骑行鞋', '骑行袜',
        '头盔', '手套', '眼镜', '水壶', '码表',
        '车灯', '车包', '打气筒', '修车工具', '车锁'
      ]
    },
    {
      name: '游泳装备',
      slug: 'swimming',
      icon: 'fa-swimmer',
      items: [
        '泳衣', '泳裤', '比基尼', '泳帽', '泳镜',
        '鼻夹', '耳塞', '浮板', '脚蹼', '手蹼',
        '呼吸管', '潜水服', '救生衣', '游泳圈', '浮力背心'
      ]
    },
    {
      name: '健身器材',
      slug: 'fitness',
      icon: 'fa-dumbbell',
      items: [
        '哑铃', '杠铃', '壶铃', '健身车', '跑步机',
        '椭圆机', '划船机', '动感单车', '综合训练器', '拉力器',
        '健腹轮', '俯卧撑架', '引体向上杆', '瑜伽垫', '健身球'
      ]
    },
    {
      name: '瑜伽用品',
      slug: 'yoga',
      icon: 'fa-pray',
      items: [
        '瑜伽垫', '瑜伽砖', '瑜伽带', '瑜伽球', '瑜伽轮',
        '瑜伽服', '瑜伽袜', '瑜伽毯', '瑜伽枕', '瑜伽包',
        '冥想垫', '冥想凳', '熏香', '精油', '音乐播放器'
      ]
    },
    {
      name: '球类运动',
      slug: 'ball-sports',
      icon: 'fa-baseball',
      items: [
        '篮球', '足球', '排球', '羽毛球', '乒乓球',
        '网球', '高尔夫球', '棒球', '垒球', '手球',
        '曲棍球', '橄榄球', '保龄球', '台球', '壁球'
      ]
    },
    {
      name: '水上运动',
      slug: 'water-sports',
      icon: 'fa-water',
      items: [
        '冲浪板', '桨板', '皮划艇', '摩托艇', '帆船',
        '潜水装备', '浮潜装备', '水肺装备', '滑水板', '香蕉船',
        '水上沙发', '水上摩托', '水上飞行器', '水下推进器', '救生设备'
      ]
    },
    {
      name: '冬季运动',
      slug: 'winter-sports',
      icon: 'fa-snowflake',
      items: [
        '滑雪板', '滑雪杖', '滑雪鞋', '滑雪服', '滑雪镜',
        '滑雪头盔', '滑雪手套', '滑雪袜', '护臀', '护膝',
        '雪橇', '雪地摩托', '冰刀', '冰球装备', '冰壶'
      ]
    }
  ];

  // 4. 美妆护肤
  const beautyLevel2 = [
    {
      name: '护肤',
      slug: 'skincare',
      icon: 'fa-spa',
      items: [
        '洁面', '化妆水', '精华', '乳液', '面霜',
        '眼霜', '防晒', '面膜', '卸妆', '去角质',
        '颈霜', '手霜', '身体乳', '润唇膏', '护肤油'
      ]
    },
    {
      name: '彩妆',
      slug: 'makeup',
      icon: 'fa-paint-brush',
      items: [
        '粉底', '遮瑕', '散粉', '腮红', '修容',
        '眼影', '眼线', '睫毛膏', '眉笔', '口红',
        '唇釉', '唇线笔', '妆前乳', '定妆喷雾', '美妆工具'
      ]
    },
    {
      name: '香水',
      slug: 'perfume',
      icon: 'fa-spray-can',
      items: [
        '女士香水', '男士香水', '中性香水', '淡香水', '浓香水',
        '古龙水', '香体喷雾', '固体香水', '香水油', '旅行装',
        'Q版香水', '香水套装', '车载香水', '家居香氛', '香薰'
      ]
    },
    {
      name: '美发',
      slug: 'haircare',
      icon: 'fa-cut',
      items: [
        '洗发水', '护发素', '发膜', '护发精油', '定型产品',
        '染发剂', '烫发剂', '造型工具', '美发梳', '发饰',
        '假发', '接发', '头皮护理', '防脱产品', '生发产品'
      ]
    },
    {
      name: '美甲',
      slug: 'nail-care',
      icon: 'fa-hand',
      items: [
        '指甲油', '底油', '顶油', '甲油胶', '美甲工具',
        '美甲灯', '贴纸', '甲片', '卸甲水', '营养油',
        '手膜', '指缘油', '打磨工具', '彩绘工具', '光疗胶'
      ]
    },
    {
      name: '男士护肤',
      slug: 'mens-grooming',
      icon: 'fa-male',
      items: [
        '男士洁面', '男士爽肤水', '男士乳液', '男士面霜', '男士防晒',
        '剃须膏', '须后水', '剃须刀', '男士面膜', '男士精华',
        '男士眼霜', '男士身体乳', '男士护手霜', '男士润唇膏', '男士香水'
      ]
    },
    {
      name: '身体护理',
      slug: 'body-care',
      icon: 'fa-bath',
      items: [
        '沐浴露', '身体乳', '磨砂膏', '润肤油', '止汗露',
        '脱毛产品', '香皂', '浴盐', '浴球', '浴刷',
        '身体喷雾', '紧致霜', '纤体霜', '美胸产品', '私处护理'
      ]
    },
    {
      name: '口腔护理',
      slug: 'oral-care',
      icon: 'fa-tooth',
      items: [
        '牙膏', '牙刷', '漱口水', '牙线', '牙贴',
        '洗牙器', '舌苔刷', '假牙清洁', '口腔喷雾', '牙齿美白',
        '儿童牙膏', '儿童牙刷', '正畸护理', '牙套清洁', '冲牙器'
      ]
    },
    {
      name: '美容工具',
      slug: 'beauty-tools',
      icon: 'fa-tools',
      items: [
        '美容仪', '导入仪', '洁面仪', '蒸脸器', '黑头仪',
        '睫毛夹', '化妆刷', '粉扑', '美妆蛋', '修眉刀',
        '镊子', '剪刀', '卷发棒', '直发夹', '吹风机'
      ]
    }
  ];

  // 5. 食品饮料
  const foodLevel2 = [
    {
      name: '休闲零食',
      slug: 'snacks',
      icon: 'fa-cookie',
      items: [
        '薯片', '膨化食品', '坚果', '瓜子', '花生',
        '饼干', '曲奇', '威化', '巧克力', '糖果',
        '果冻', '布丁', '肉干', '肉松', '鱼干',
        '海苔', '豆干', '辣条', '魔芋爽', '卤味'
      ]
    },
    {
      name: '方便速食',
      slug: 'instant-food',
      icon: 'fa-utensils',
      items: [
        '方便面', '自热火锅', '自热米饭', '速冻水饺', '速冻馄饨',
        '速冻包子', '速冻汤圆', '速冻粽子', '速冻春卷', '方便粥',
        '方便粉丝', '方便米线', '方便酸辣粉', '方便螺蛳粉', '方便凉皮'
      ]
    },
    {
      name: '粮油调味',
      slug: 'groceries',
      icon: 'fa-oil',
      items: [
        '大米', '面粉', '杂粮', '食用油', '酱油',
        '醋', '料酒', '蚝油', '番茄酱', '沙拉酱',
        '盐', '糖', '味精', '鸡精', '花椒',
        '八角', '桂皮', '香叶', '辣椒', '五香粉'
      ]
    },
    {
      name: '饮料',
      slug: 'beverages',
      icon: 'fa-mug-hot',
      items: [
        '碳酸饮料', '果汁', '茶饮料', '咖啡饮料', '运动饮料',
        '功能饮料', '植物蛋白饮料', '乳饮料', '矿泉水', '纯净水',
        '苏打水', '气泡水', '能量饮料', '电解质饮料', '维生素饮料'
      ]
    },
    {
      name: '咖啡',
      slug: 'coffee',
      icon: 'fa-mug-hot',
      items: [
        '挂耳咖啡', '速溶咖啡', '咖啡豆', '咖啡粉', '胶囊咖啡',
        '冷萃咖啡', '冻干咖啡', '低因咖啡', '有机咖啡', '精品咖啡',
        '意式咖啡', '美式咖啡', '拿铁', '卡布奇诺', '摩卡'
      ]
    },
    {
      name: '茶叶',
      slug: 'tea',
      icon: 'fa-leaf',
      items: [
        '绿茶', '红茶', '乌龙茶', '白茶', '黄茶',
        '黑茶', '普洱茶', '花茶', '果茶', '养生茶',
        '龙井', '碧螺春', '铁观音', '大红袍', '金骏眉'
      ]
    },
    {
      name: '酒类',
      slug: 'alcohol',
      icon: 'fa-wine-bottle',
      items: [
        '白酒', '啤酒', '葡萄酒', '洋酒', '黄酒',
        '清酒', '米酒', '果酒', '预调酒', '起泡酒',
        '茅台', '五粮液', '拉菲', '轩尼诗', '青岛啤酒'
      ]
    },
    {
      name: '乳制品',
      slug: 'dairy',
      icon: 'fa-cow',
      items: [
        '纯牛奶', '酸奶', '奶粉', '奶酪', '黄油',
        '炼乳', '奶油', '奶片', '奶昔', '乳酸菌',
        '儿童奶', '老年奶', '高钙奶', '脱脂奶', '全脂奶'
      ]
    },
    {
      name: '保健品',
      slug: 'supplements',
      icon: 'fa-pills',
      items: [
        '鱼油', '蛋白粉', '维生素', '钙片', '益生菌',
        '胶原蛋白', '葡萄籽', '辅酶Q10', '护肝片', '褪黑素',
        '氨糖', '卵磷脂', '螺旋藻', '蜂胶', '蜂王浆'
      ]
    },
    {
      name: '生鲜',
      slug: 'fresh-food',
      icon: 'fa-fish',
      items: [
        '蔬菜', '水果', '肉类', '禽类', '海鲜',
        '鸡蛋', '豆制品', '冷冻食品', '预制菜', '半成品',
        '有机蔬菜', '进口水果', '牛排', '三文鱼', '大闸蟹'
      ]
    },
    {
      name: '烘焙',
      slug: 'baking',
      icon: 'fa-bread-slice',
      items: [
        '面包', '蛋糕', '吐司', '牛角包', '甜甜圈',
        '蛋挞', '泡芙', '马卡龙', '曲奇', '饼干',
        '烘焙原料', '烘焙工具', '烘焙模具', '烘焙包装', '烘焙装饰'
      ]
    },
    {
      name: '滋补品',
      slug: 'tonics',
      icon: 'fa-heart',
      items: [
        '燕窝', '海参', '花胶', '人参', '鹿茸',
        '冬虫夏草', '灵芝', '石斛', '阿胶', '枸杞',
        '红枣', '桂圆', '银耳', '桃胶', '雪燕'
      ]
    }
  ];

  // 6. 家居用品
  const homeLevel2 = [
    {
      name: '床上用品',
      slug: 'bedding',
      icon: 'fa-bed',
      items: [
        '四件套', '被套', '床单', '枕套', '被芯',
        '枕芯', '床垫', '床褥', '毯子', '凉席',
        '蚊帐', '抱枕', '靠垫', '床罩', '床裙'
      ]
    },
    {
      name: '厨房用品',
      slug: 'kitchen',
      icon: 'fa-utensils',
      items: [
        '锅具', '炒锅', '煎锅', '汤锅', '蒸锅',
        '压力锅', '电饭煲', '电磁炉', '微波炉', '烤箱',
        '空气炸锅', '破壁机', '榨汁机', '咖啡机', '面包机',
        '刀具', '砧板', '碗碟', '筷子', '勺子'
      ]
    },
    {
      name: '餐具',
      slug: 'tableware',
      icon: 'fa-plate',
      items: [
        '碗', '盘子', '筷子', '勺子', '叉子',
        '杯子', '茶具', '酒具', '保鲜盒', '饭盒',
        '陶瓷餐具', '玻璃餐具', '不锈钢餐具', '木质餐具', '一次性餐具'
      ]
    },
    {
      name: '收纳整理',
      slug: 'storage',
      icon: 'fa-boxes',
      items: [
        '收纳箱', '收纳盒', '收纳架', '收纳袋', '衣架',
        '鞋架', '书架', '置物架', '挂钩', '挂篮',
        '真空压缩袋', '化妆品收纳', '厨房收纳', '衣柜收纳', '浴室收纳'
      ]
    },
    {
      name: '清洁工具',
      slug: 'cleaning',
      icon: 'fa-broom',
      items: [
        '拖把', '扫把', '簸箕', '垃圾桶', '垃圾袋',
        '抹布', '海绵', '刷子', '手套', '清洁剂',
        '消毒液', '除菌液', '洗衣液', '柔顺剂', '漂白剂'
      ]
    },
    {
      name: '浴室用品',
      slug: 'bathroom',
      icon: 'fa-shower',
      items: [
        '毛巾', '浴巾', '地垫', '浴帘', '牙刷架',
        '肥皂盒', '沐浴球', '浴室架', '马桶垫', '马桶刷',
        '防滑垫', '吸水垫', '浴帽', '浴袍', '拖鞋'
      ]
    },
    {
      name: '家居装饰',
      slug: 'home-decor',
      icon: 'fa-paint-roller',
      items: [
        '装饰画', '摆件', '花瓶', '仿真花', '蜡烛',
        '香薰', '相框', '钟表', '镜子', '墙贴',
        '地毯', '窗帘', '桌布', '椅垫', '沙发套'
      ]
    },
    {
      name: '灯具',
      slug: 'lighting',
      icon: 'fa-lightbulb',
      items: [
        '台灯', '落地灯', '吊灯', '吸顶灯', '壁灯',
        '床头灯', '阅读灯', '夜灯', '氛围灯', '智能灯',
        'LED灯', '节能灯', '护眼灯', '装饰灯', '户外灯'
      ]
    },
    {
      name: '家具',
      slug: 'furniture',
      icon: 'fa-chair',
      items: [
        '沙发', '床', '衣柜', '书桌', '餐桌',
        '椅子', '茶几', '电视柜', '鞋柜', '斗柜',
        '梳妆台', '床头柜', '书架', '置物架', '儿童家具'
      ]
    }
  ];

  // 7. 家装建材
  const homeImprovementLevel2 = [
    {
      name: '涂料',
      slug: 'paint',
      icon: 'fa-paint-brush',
      items: [
        '乳胶漆', '木器漆', '金属漆', '防水涂料', '防火涂料',
        '防霉涂料', '艺术漆', '硅藻泥', '墙固', '地固',
        '腻子', '底漆', '面漆', '清漆', '色浆'
      ]
    },
    {
      name: '地板',
      slug: 'flooring',
      icon: 'fa-border-all',
      items: [
        '实木地板', '复合地板', '强化地板', '竹地板', '软木地板',
        'SPC地板', 'PVC地板', '地暖地板', '运动地板', '舞台地板',
        '木塑地板', '石塑地板', '锁扣地板', '自粘地板', '防静电地板'
      ]
    },
    {
      name: '瓷砖',
      slug: 'tiles',
      icon: 'fa-square',
      items: [
        '地砖', '墙砖', '抛光砖', '抛釉砖', '通体砖',
        '仿古砖', '大理石瓷砖', '木纹砖', '六角砖', '花砖',
        '马赛克', '腰线', '踢脚线', '过门石', '窗台石'
      ]
    },
    {
      name: '门窗',
      slug: 'doors-windows',
      icon: 'fa-door-open',
      items: [
        '防盗门', '室内门', '推拉门', '折叠门', '玻璃门',
        '塑钢窗', '铝合金窗', '断桥铝窗', '阳光房', '纱窗',
        '卷帘门', '车库门', '防火门', '隔音门', '保温门'
      ]
    },
    {
      name: '卫浴',
      slug: 'bathroom-fixtures',
      icon: 'fa-toilet',
      items: [
        '马桶', '浴室柜', '花洒', '水龙头', '浴缸',
        '淋浴房', '洗手盆', '小便斗', '妇洗器', '地漏',
        '角阀', '软管', '下水器', '马桶盖', '浴室镜'
      ]
    },
    {
      name: '厨房',
      slug: 'kitchen-fixtures',
      icon: 'fa-sink',
      items: [
        '水槽', '龙头', '橱柜', '烟机', '灶具',
        '消毒柜', '洗碗机', '净水器', '垃圾处理器', '拉篮',
        '调料架', '刀架', '砧板架', '锅架', '米箱'
      ]
    },
    {
      name: '电工电料',
      slug: 'electrical',
      icon: 'fa-bolt',
      items: [
        '开关', '插座', '电线', '电缆', '配电箱',
        '断路器', '漏电保护', '接线盒', '线管', '线槽',
        '插头', '插排', '转换器', '定时器', '遥控开关'
      ]
    },
    {
      name: '水暖管件',
      slug: 'plumbing',
      icon: 'fa-faucet',
      items: [
        '水管', '管件', '阀门', '水表', '水泵',
        '暖气片', '地暖管', '分水器', '温控器', '排气阀',
        '波纹管', '编织管', '生料带', '密封胶', '堵头'
      ]
    },
    {
      name: '五金工具',
      slug: 'hardware-tools',
      icon: 'fa-tools',
      items: [
        '锤子', '螺丝刀', '扳手', '钳子', '卷尺',
        '水平仪', '电钻', '电锯', '打磨机', '热风枪',
        '螺丝', '钉子', '膨胀管', '胶水', '胶带'
      ]
    }
  ];

  // 8. 母婴用品
  const babyLevel2 = [
    {
      name: '奶粉',
      slug: 'formula',
      icon: 'fa-bottle-droplet',
      items: [
        '1段奶粉', '2段奶粉', '3段奶粉', '4段奶粉', '特殊配方奶粉',
        '有机奶粉', '羊奶粉', '水解奶粉', '无乳糖奶粉', '早产儿奶粉',
        '进口奶粉', '国产奶粉', '孕妇奶粉', '成人奶粉', '中老年奶粉'
      ]
    },
    {
      name: '尿裤湿巾',
      slug: 'diapers',
      icon: 'fa-droplet',
      items: [
        '纸尿裤', '拉拉裤', '尿布', '隔尿垫', '湿巾',
        '棉柔巾', '云柔巾', '尿布台', '尿布桶', '尿布包',
        'NB码', 'S码', 'M码', 'L码', 'XL码'
      ]
    },
    {
      name: '婴儿食品',
      slug: 'baby-food',
      icon: 'fa-baby',
      items: [
        '米粉', '果泥', '菜泥', '肉泥', '面条',
        '饼干', '溶豆', '泡芙', '磨牙棒', '酸奶',
        '奶酪', '辅食油', '辅食调料', '即食粥', '即食面'
      ]
    },
    {
      name: '婴儿洗护',
      slug: 'baby-care',
      icon: 'fa-baby',
      items: [
        '洗发水', '沐浴露', '润肤露', '护臀膏', '爽身粉',
        '按摩油', '防晒霜', '驱蚊液', '洗衣液', '奶瓶清洗剂',
        '浴盆', '浴网', '水温计', '洗澡玩具', '浴巾'
      ]
    },
    {
      name: '婴儿服饰',
      slug: 'baby-clothing',
      icon: 'fa-baby',
      items: [
        '连体衣', '分体衣', '哈衣', '睡袋', '抱被',
        '帽子', '袜子', '手套', '围嘴', '口水巾',
        '和尚服', '蝴蝶衣', '爬服', '外出服', '保暖内衣'
      ]
    },
    {
      name: '喂养用品',
      slug: 'feeding',
      icon: 'fa-baby-bottle',
      items: [
        '奶瓶', '奶嘴', '安抚奶嘴', '奶瓶刷', '奶瓶夹',
        '温奶器', '消毒器', '调奶器', '保温杯', '吸管杯',
        '鸭嘴杯', '训练杯', '辅食碗', '辅食勺', '咬咬袋'
      ]
    },
    {
      name: '婴儿玩具',
      slug: 'baby-toys',
      icon: 'fa-puzzle-piece',
      items: [
        '摇铃', '牙胶', '布书', '床铃', '健身架',
        '安抚巾', '安抚玩具', '音乐玩具', '感官玩具', '抓握玩具',
        '叠叠乐', '形状盒', '堆塔', '不倒翁', '洗澡玩具'
      ]
    },
    {
      name: '婴儿床品',
      slug: 'baby-bedding',
      icon: 'fa-bed',
      items: [
        '婴儿床', '床垫', '床围', '枕头', '被子',
        '睡袋', '蚊帐', '床铃', '床单', '被套',
        '摇篮', '摇椅', '安抚床', '便携床', '旅行床'
      ]
    },
    {
      name: '婴儿出行',
      slug: 'baby-travel',
      icon: 'fa-baby-carriage',
      items: [
        '婴儿车', '婴儿背带', '腰凳', '安全座椅', '提篮',
        '妈咪包', '遮阳篷', '雨罩', '蚊帐', '凉席',
        '推车垫', '推车挂篮', '推车挂钩', '推车水杯架', '推车置物袋'
      ]
    },
    {
      name: '孕产妇用品',
      slug: 'maternity',
      icon: 'fa-person-pregnant',
      items: [
        '孕妇装', '孕妇裤', '孕妇内衣', '托腹带', '哺乳文胸',
        '防溢乳垫', '吸奶器', '储奶袋', '乳头霜', '妊娠纹霜',
        '待产包', '产后护理', '收腹带', '骨盆带', '月子服'
      ]
    }
  ];

  // 9. 宠物用品
  const petLevel2 = [
    {
      name: '狗粮',
      slug: 'dog-food',
      icon: 'fa-dog',
      items: [
        '幼犬粮', '成犬粮', '老年犬粮', '小型犬粮', '中型犬粮',
        '大型犬粮', '天然粮', '无谷粮', '冻干粮', '风干粮',
        '处方粮', '减肥粮', '美毛粮', '关节粮', '肠胃粮'
      ]
    },
    {
      name: '猫粮',
      slug: 'cat-food',
      icon: 'fa-cat',
      items: [
        '幼猫粮', '成猫粮', '老年猫粮', '室内猫粮', '去毛球猫粮',
        '泌尿猫粮', '天然粮', '无谷粮', '冻干粮', '风干粮',
        '处方粮', '减肥粮', '美毛粮', '肠胃粮', '挑食猫粮'
      ]
    },
    {
      name: '宠物零食',
      slug: 'pet-treats',
      icon: 'fa-bone',
      items: [
        '狗零食', '猫零食', '肉干', '肉条', '磨牙棒',
        '洁齿骨', '罐头', '湿粮包', '猫条', '猫草',
        '营养膏', '化毛膏', '羊奶', '宠物酸奶', '宠物蛋糕'
      ]
    },
    {
      name: '宠物用品',
      slug: 'pet-supplies',
      icon: 'fa-paw',
      items: [
        '狗窝', '猫窝', '狗笼', '猫笼', '宠物垫',
        '宠物玩具', '牵引绳', '项圈', '胸背', '嘴套',
        '食盆', '水盆', '自动喂食器', '自动饮水机', '宠物监控'
      ]
    },
    {
      name: '宠物洗护',
      slug: 'pet-grooming',
      icon: 'fa-scissors',
      items: [
        '宠物香波', '宠物护毛素', '宠物梳子', '宠物剪毛器',
        '宠物指甲剪', '宠物牙刷', '宠物牙膏', '宠物湿巾',
        '宠物除味剂', '宠物消毒液', '宠物护爪膏', '宠物护眼液',
        '宠物耳部清洁', '宠物口腔清洁', '宠物剃毛器'
      ]
    },
    {
      name: '宠物医疗',
      slug: 'pet-health',
      icon: 'fa-syringe',
      items: [
        '驱虫药', '疫苗', '消炎药', '益生菌', '营养膏',
        '钙片', '维生素', '鱼油', '关节保健', '肠胃保健',
        '皮肤病药', '耳病药', '眼病药', '呼吸道药', '消毒喷剂'
      ]
    }
  ];

  // 10. 汽车用品
  const autoLevel2 = [
    {
      name: '机油',
      slug: 'engine-oil',
      icon: 'fa-oil',
      items: [
        '全合成机油', '半合成机油', '矿物油', '5W-30', '5W-40',
        '0W-20', '0W-30', '0W-40', '10W-40', '15W-40',
        '柴油机油', '摩托车机油', '赛车机油', '节能机油', '长效机油'
      ]
    },
    {
      name: '轮胎',
      slug: 'tires',
      icon: 'fa-circle',
      items: [
        '轿车轮胎', 'SUV轮胎', '越野轮胎', '雪地胎', '四季胎',
        '防爆胎', '静音胎', '节能胎', '高性能胎', '缺气保用胎',
        '15寸轮胎', '16寸轮胎', '17寸轮胎', '18寸轮胎', '19寸轮胎'
      ]
    },
    {
      name: '行车记录仪',
      slug: 'dash-cam',
      icon: 'fa-video',
      items: [
        '单镜头记录仪', '双镜头记录仪', '前后双录', '流媒体记录仪',
        '隐藏式记录仪', '后视镜记录仪', '4K记录仪', '夜视记录仪',
        '停车监控', 'GPS记录仪', '电子狗记录仪', 'ADAS记录仪'
      ]
    },
    {
      name: '车载电器',
      slug: 'car-electronics',
      icon: 'fa-car',
      items: [
        '车载充电器', '车载逆变器', '车载吸尘器', '车载充气泵',
        '车载冰箱', '车载加热杯', '车载净化器', '车载加湿器',
        '车载按摩垫', '车载音响', '车载低音炮', '车载功放'
      ]
    },
    {
      name: '汽车美容',
      slug: 'car-care',
      icon: 'fa-spray-can',
      items: [
        '洗车液', '洗车水蜡', '洗车泥', '洗车海绵', '洗车毛巾',
        '车蜡', '镀膜剂', '镀晶剂', '玻璃水', '雨刷精',
        '轮胎蜡', '内饰清洁剂', '真皮护理', '仪表盘蜡', '柏油清洗剂'
      ]
    },
    {
      name: '汽车装饰',
      slug: 'car-accessories',
      icon: 'fa-star',
      items: [
        '脚垫', '座套', '方向盘套', '挂件', '摆件',
        '香水', '炭包', '贴纸', '车标', '轮毂盖',
        '防撞条', '门碗', '雨眉', '晴雨挡', '挡泥板'
      ]
    }
  ];

  // 11. 图书音像
  const mediaLevel2 = [
    {
      name: '图书',
      slug: 'books',
      icon: 'fa-book',
      items: [
        '文学', '小说', '历史', '哲学', '心理',
        '经济', '管理', '营销', '计算机', '编程',
        '外语', '考试', '教辅', '童书', '绘本',
        '科普', '艺术', '摄影', '音乐', '传记'
      ]
    },
    {
      name: '音像',
      slug: 'media',
      icon: 'fa-compact-disc',
      items: [
        'CD', 'DVD', '蓝光', '黑胶', '磁带',
        '演唱会', '音乐会', '电影', '电视剧', '纪录片',
        '教学视频', '健身视频', '瑜伽视频', '舞蹈视频', '戏曲'
      ]
    }
  ];

  // 12. 办公用品
  const officeLevel2 = [
    {
      name: '办公文具',
      slug: 'office-stationery',
      icon: 'fa-pen',
      items: [
        '中性笔', '圆珠笔', '钢笔', '铅笔', '记号笔',
        '荧光笔', '白板笔', '黑板笔', '水彩笔', '蜡笔',
        '笔记本', '记事本', '便签本', '便利贴', '便签纸',
        '文件夹', '资料册', '档案袋', '文件袋', '文件盒'
      ]
    },
    {
      name: '办公纸品',
      slug: 'office-paper',
      icon: 'fa-copy',
      items: [
        '复印纸', '打印纸', '复写纸', '热敏纸', '相纸',
        '便签纸', '信纸', '稿纸', '便条纸', '记事纸',
        'A4纸', 'A3纸', 'B5纸', '16K纸', '8K纸'
      ]
    },
    {
      name: '办公设备',
      slug: 'office-equipment',
      icon: 'fa-print',
      items: [
        '打印机', '复印机', '扫描仪', '传真机', '碎纸机',
        '装订机', '过塑机', '考勤机', '投影仪', '会议电话',
        '计算器', '订书机', '打孔机', '号码机', '日期章'
      ]
    },
    {
      name: '办公家具',
      slug: 'office-furniture',
      icon: 'fa-chair',
      items: [
        '办公桌', '办公椅', '文件柜', '书柜', '会议桌',
        '接待台', '屏风', '隔断', '白板', '公告栏',
        '保险柜', '钥匙箱', '储物柜', '衣帽架', '鞋柜'
      ]
    }
  ];

  // 13. 乐器
  const musicalLevel2 = [
    {
      name: '吉他',
      slug: 'guitar',
      icon: 'fa-guitar',
      items: [
        '民谣吉他', '古典吉他', '电吉他', '贝斯', '尤克里里',
        '吉他弦', '拨片', '琴包', '琴架', '效果器',
        '吉他音箱', '调音器', '节拍器', '吉他踏板', '吉他连线'
      ]
    },
    {
      name: '钢琴',
      slug: 'piano',
      icon: 'fa-piano',
      items: [
        '立式钢琴', '三角钢琴', '电钢琴', '电子琴', '合成器',
        'MIDI键盘', '钢琴凳', '钢琴罩', '节拍器', '琴谱架',
        '踏板', '钢琴灯', '钢琴油', '钢琴键布', '钢琴脚垫'
      ]
    },
    {
      name: '管弦乐',
      slug: 'orchestral',
      icon: 'fa-music',
      items: [
        '小提琴', '中提琴', '大提琴', '低音提琴', '竖琴',
        '长笛', '单簧管', '双簧管', '巴松管', '萨克斯',
        '小号', '圆号', '长号', '大号', '打击乐'
      ]
    },
    {
      name: '民族乐器',
      slug: 'traditional',
      icon: 'fa-drum',
      items: [
        '古筝', '古琴', '琵琶', '二胡', '笛子',
        '箫', '葫芦丝', '巴乌', '扬琴', '阮',
        '箜篌', '编钟', '鼓', '锣', '钹'
      ]
    },
    {
      name: '打击乐',
      slug: 'percussion',
      icon: 'fa-drum',
      items: [
        '架子鼓', '电子鼓', '军鼓', '嗵鼓', '底鼓',
        '镲片', '踩镲', '鼓棒', '鼓刷', '鼓槌',
        '打击板', '非洲鼓', '康佳鼓', '邦戈鼓', '卡宏'
      ]
    }
  ];

  // 14. 珠宝首饰
  const jewelryLevel2 = [
    {
      name: '黄金',
      slug: 'gold',
      icon: 'fa-crown',
      items: [
        '黄金项链', '黄金手链', '黄金手镯', '黄金戒指', '黄金耳环',
        '黄金吊坠', '黄金转运珠', '黄金金条', '黄金金币', '黄金摆件',
        '24K黄金', '22K黄金', '18K黄金', '14K黄金', '10K黄金'
      ]
    },
    {
      name: '钻石',
      slug: 'diamond',
      icon: 'fa-gem',
      items: [
        '钻石项链', '钻石手链', '钻石手镯', '钻石戒指', '钻石耳环',
        '钻石吊坠', '钻戒', '订婚钻戒', '结婚钻戒', '钻石对戒',
        '裸钻', '异形钻', '圆形钻', '公主方钻', '心形钻'
      ]
    },
    {
      name: '银饰',
      slug: 'silver',
      icon: 'fa-gem',
      items: [
        '银项链', '银手链', '银手镯', '银戒指', '银耳环',
        '银吊坠', '银对戒', '儿童银饰', '银餐具', '银酒具',
        '925银', '990银', '999银', '泰银', '藏银'
      ]
    },
    {
      name: '玉石',
      slug: 'jade',
      icon: 'fa-gem',
      items: [
        '翡翠', '和田玉', '独山玉', '岫玉', '绿松石',
        '青金石', '玛瑙', '玉髓', '石英岩', '蛇纹石',
        '翡翠手镯', '翡翠挂件', '翡翠戒指', '和田玉吊坠', '和田玉手镯'
      ]
    },
    {
      name: '珍珠',
      slug: 'pearl',
      icon: 'fa-circle',
      items: [
        '珍珠项链', '珍珠手链', '珍珠耳环', '珍珠戒指', '珍珠吊坠',
        '海水珍珠', '淡水珍珠', '南洋珍珠', '大溪地珍珠', '日本Akoya珍珠',
        '巴洛克珍珠', '马贝珍珠', '爱迪生珍珠', 'keshi珍珠', '珍珠套件'
      ]
    }
  ];

  // 15. 钟表眼镜
  const watchLevel2 = [
    {
      name: '手表',
      slug: 'watches',
      icon: 'fa-clock',
      items: [
        '机械表', '石英表', '电子表', '智能手表', '运动手表',
        '商务手表', '休闲手表', '情侣表', '儿童表', '怀表',
        '男表', '女表', '中性表', '潜水表', '飞行表'
      ]
    },
    {
      name: '眼镜',
      slug: 'eyewear',
      icon: 'fa-glasses',
      items: [
        '近视眼镜', '远视眼镜', '散光眼镜', '老花镜', '太阳镜',
        '防蓝光眼镜', '运动眼镜', '滑雪镜', '泳镜', '护目镜',
        '隐形眼镜', '美瞳', '眼镜框', '眼镜片', '眼镜盒'
      ]
    }
  ];

  // 16. 箱包皮具
  const bagLevel2 = [
    {
      name: '女包',
      slug: 'women-bags',
      icon: 'fa-bag-shopping',
      items: [
        '单肩包', '斜挎包', '手提包', '双肩包', '钱包',
        '卡包', '零钱包', '化妆包', '购物袋', '托特包',
        '水桶包', '马鞍包', '波士顿包', '贝壳包', '饺子包'
      ]
    },
    {
      name: '男包',
      slug: 'men-bags',
      icon: 'fa-bag-shopping',
      items: [
        '公文包', '手提包', '单肩包', '斜挎包', '双肩包',
        '钱包', '卡包', '钥匙包', '手拿包', '胸包',
        '腰包', '旅行包', '电脑包', '文件包', '工具包'
      ]
    },
    {
      name: '拉杆箱',
      slug: 'luggage',
      icon: 'fa-suitcase',
      items: [
        '20寸登机箱', '24寸托运箱', '28寸托运箱', '32寸托运箱',
        'PC箱', 'ABS箱', '铝合金箱', '布箱', '皮箱',
        '万向轮', '静音轮', '刹车轮', 'TSA锁', '扩容层'
      ]
    }
  ];

  // 17. 个护健康
  const personalCareLevel2 = [
    {
      name: '个人护理',
      slug: 'personal-care',
      icon: 'fa-heart-pulse',
      items: [
        '剃须刀', '脱毛器', '理发器', '吹风机', '卷发棒',
        '直发夹', '美容仪', '洁面仪', '按摩器', '足浴盆',
        '按摩椅', '按摩枕', '按摩披肩', '按摩垫', '筋膜枪'
      ]
    },
    {
      name: '健康监测',
      slug: 'health-monitor',
      icon: 'fa-heart',
      items: [
        '血压计', '血糖仪', '体温计', '体脂秤', '体重秤',
        '血氧仪', '心率监测', '胎心仪', '听力计', '视力表',
        '雾化器', '吸氧机', '制氧机', '呼吸机', '理疗仪'
      ]
    },
    {
      name: '计生用品',
      slug: 'family-planning',
      icon: 'fa-heart',
      items: [
        '安全套', '验孕棒', '排卵试纸', '早孕试纸', '润滑液',
        '避孕药', '紧急避孕药', '短效避孕药', '长效避孕药', '节育环',
        '体温计', '排卵仪', '备孕仪', '胎心仪', '胎教仪'
      ]
    }
  ];

  // 18. 成人情趣
  const adultLevel2 = [
    {
      name: '震动棒',
      slug: 'vibrators',
      icon: 'fa-bolt',
      items: [
        '无线震动棒', '迷你震动棒', '双头震动棒', 'G点震动棒', '可充电震动棒',
        '静音震动棒', '防水震动棒', '震动棒套装', '遥控震动棒', 'APP震动棒',
        '魔法棒', '按摩棒', '情趣棒', '震蛋', '跳蛋'
      ]
    },
    {
      name: '跳蛋',
      slug: 'egg-vibrators',
      icon: 'fa-circle',
      items: [
        '无线跳蛋', '迷你跳蛋', '遥控跳蛋', 'APP跳蛋', '静音跳蛋',
        '防水跳蛋', '可充电跳蛋', '跳蛋套装', '双人跳蛋', '情侣跳蛋',
        '震动跳蛋', '吮吸跳蛋', '加热跳蛋', '穿戴跳蛋', '蛋中蛋'
      ]
    },
    {
      name: '飞机杯',
      slug: 'masturbators',
      icon: 'fa-cube',
      items: [
        '手动飞机杯', '电动飞机杯', '震动飞机杯', '伸缩飞机杯', '吮吸飞机杯',
        'VR飞机杯', '智能飞机杯', 'APP飞机杯', '加热飞机杯', '可拆卸飞机杯',
        '名器', '倒模', '实体娃娃', '半身娃娃', '臀部娃娃'
      ]
    },
    {
      name: '充气娃娃',
      slug: 'love-dolls',
      icon: 'fa-person',
      items: [
        'TPE娃娃', '硅胶娃娃', '半身娃娃', '全身娃娃', '充气娃娃',
        '实体娃娃', '迷你娃娃', '骨架娃娃', '定制娃娃', '便携娃娃',
        '女优娃娃', '动漫娃娃', 'VR娃娃', '智能娃娃', '语音娃娃'
      ]
    },
    {
      name: '情趣内衣',
      slug: 'lingerie',
      icon: 'fa-tshirt',
      items: [
        '透明内衣', '蕾丝内衣', '丁字裤', '开裆裤', '连体衣',
        '护士服', '教师服', '女仆装', '学生装', 'OL装',
        '制服', '旗袍', '汉服', 'COS服', '角色扮演'
      ]
    },
    {
      name: '束缚用品',
      slug: 'bondage',
      icon: 'fa-link',
      items: [
        '手铐', '脚镣', '绳索', '眼罩', '口球',
        '皮鞭', '蜡烛', '束缚带', '束缚衣', '束缚床',
        '十字架', '吊架', '笼子', '项圈', '牵引绳'
      ]
    },
    {
      name: '润滑液',
      slug: 'lubricants',
      icon: 'fa-droplet',
      items: [
        '水基润滑液', '硅基润滑液', '油基润滑液', '可食用润滑液',
        '加热润滑液', '冰感润滑液', '延时润滑液', '敏感润滑液',
        '抗菌润滑液', '天然润滑液', '无味润滑液', '水果味润滑液'
      ]
    },
    {
      name: '安全套',
      slug: 'condoms',
      icon: 'fa-circle',
      items: [
        '超薄安全套', '持久安全套', '螺纹安全套', '颗粒安全套',
        '加热安全套', '冰感安全套', '水果味安全套', '彩色安全套',
        '凸点安全套', '紧身安全套', '大号安全套', '女用安全套'
      ]
    }
  ];

  // 19. 礼品鲜花
  const giftLevel2 = [
    {
      name: '鲜花',
      slug: 'flowers',
      icon: 'fa-leaf',
      items: [
        '玫瑰花', '百合花', '康乃馨', '向日葵', '雏菊',
        '郁金香', '满天星', '勿忘我', '紫罗兰', '马蹄莲',
        '花束', '花篮', '花盒', '永生花', '干花'
      ]
    },
    {
      name: '绿植',
      slug: 'plants',
      icon: 'fa-seedling',
      items: [
        '多肉植物', '观叶植物', '观花植物', '水培植物', '空气凤梨',
        '绿萝', '吊兰', '发财树', '幸福树', '富贵竹',
        '仙人掌', '芦荟', '虎皮兰', '龟背竹', '琴叶榕'
      ]
    },
    {
      name: '礼品',
      slug: 'gifts',
      icon: 'fa-gift',
      items: [
        '创意礼品', '定制礼品', '情侣礼品', '闺蜜礼品', '同学礼品',
        '同事礼品', '商务礼品', '节日礼品', '生日礼品', '纪念日礼品',
        '表白礼品', '求婚礼品', '结婚礼品', '乔迁礼品', '探病礼品'
      ]
    }
  ];

  // 20. 虚拟商品
  const virtualLevel2 = [
    {
      name: '游戏点卡',
      slug: 'game-cards',
      icon: 'fa-gamepad',
      items: [
        '点卡', '月卡', '季卡', '年卡', '代币',
        '皮肤', '道具', '装备', '礼包', '会员',
        'Steam充值', 'PSN充值', 'Xbox充值', 'NS充值', '手游充值'
      ]
    },
    {
      name: '会员服务',
      slug: 'membership',
      icon: 'fa-crown',
      items: [
        '视频会员', '音乐会员', '阅读会员', '学习会员', '办公会员',
        '爱奇艺会员', '腾讯视频会员', '优酷会员', '芒果TV会员', 'B站大会员',
        '网易云音乐会员', 'QQ音乐会员', '酷狗音乐会员', '喜马拉雅会员', '知乎会员'
      ]
    },
    {
      name: '电子券',
      slug: 'e-coupons',
      icon: 'fa-ticket',
      items: [
        '代金券', '优惠券', '礼品卡', '购物卡', '加油卡',
        '话费充值', '流量充值', '水电煤缴费', '电影票', '演出票',
        '景点门票', '飞机票', '火车票', '酒店券', '餐饮券'
      ]
    }
  ];

  // 合并所有二级目录
  const allLevel2Groups = [
    { level1: level1Categories[0], level2List: digitalLevel2 },
    { level1: level1Categories[1], level2List: clothingLevel2 },
    { level1: level1Categories[2], level2List: sportsLevel2 },
    { level1: level1Categories[3], level2List: beautyLevel2 },
    { level1: level1Categories[4], level2List: foodLevel2 },
    { level1: level1Categories[5], level2List: homeLevel2 },
    { level1: level1Categories[6], level2List: homeImprovementLevel2 },
    { level1: level1Categories[7], level2List: babyLevel2 },
    { level1: level1Categories[8], level2List: petLevel2 },
    { level1: level1Categories[9], level2List: autoLevel2 },
    { level1: level1Categories[10], level2List: mediaLevel2 },
    { level1: level1Categories[11], level2List: officeLevel2 },
    { level1: level1Categories[12], level2List: musicalLevel2 },
    { level1: level1Categories[13], level2List: jewelryLevel2 },
    { level1: level1Categories[14], level2List: watchLevel2 },
    { level1: level1Categories[15], level2List: bagLevel2 },
    { level1: level1Categories[16], level2List: personalCareLevel2 },
    { level1: level1Categories[17], level2List: adultLevel2 },
    { level1: level1Categories[18], level2List: giftLevel2 },
    { level1: level1Categories[19], level2List: virtualLevel2 }
  ];

  // 为每个三级品类生成维度
  function generateDimensions(itemName) {
    const commonDimensions = [
      { name: '性价比最高', importance: 7 },
      { name: '品牌最好', importance: 6 },
      { name: '销量最好', importance: 5 },
      { name: '口碑最好', importance: 5 }
    ];
    
    // 根据品类特性添加特定维度
    const specificDimensions = [];
    
    if (itemName.includes('手机') || itemName.includes('平板') || itemName.includes('电脑')) {
      specificDimensions.push({ name: '性能最强', importance: 10 });
      specificDimensions.push({ name: '续航最长', importance: 9 });
      specificDimensions.push({ name: '拍照最好', importance: 8 });
    } else if (itemName.includes('耳机')) {
      specificDimensions.push({ name: '音质最好', importance: 10 });
      specificDimensions.push({ name: '降噪最好', importance: 9 });
      specificDimensions.push({ name: '佩戴最舒适', importance: 8 });
    } else if (itemName.includes('鞋')) {
      specificDimensions.push({ name: '最舒适', importance: 10 });
      specificDimensions.push({ name: '最耐穿', importance: 9 });
      specificDimensions.push({ name: '最轻', importance: 8 });
    } else if (itemName.includes('T恤') || itemName.includes('衬衫') || itemName.includes('内衣')) {
      specificDimensions.push({ name: '面料最好', importance: 10 });
      specificDimensions.push({ name: '最舒适', importance: 9 });
      specificDimensions.push({ name: '版型最好', importance: 8 });
    } else if (itemName.includes('护肤') || itemName.includes('精华') || itemName.includes('面霜')) {
      specificDimensions.push({ name: '效果最好', importance: 10 });
      specificDimensions.push({ name: '吸收最快', importance: 9 });
      specificDimensions.push({ name: '最温和', importance: 8 });
    } else if (itemName.includes('食品') || itemName.includes('零食')) {
      specificDimensions.push({ name: '口感最好', importance: 10 });
      specificDimensions.push({ name: '配料最好', importance: 9 });
      specificDimensions.push({ name: '包装最好', importance: 8 });
    } else if (itemName.includes('震动棒') || itemName.includes('跳蛋')) {
      specificDimensions.push({ name: '震动力度最强', importance: 10 });
      specificDimensions.push({ name: '静音最好', importance: 9 });
      specificDimensions.push({ name: '续航最长', importance: 8 });
    } else {
      specificDimensions.push({ name: '品质最好', importance: 10 });
      specificDimensions.push({ name: '最耐用', importance: 9 });
      specificDimensions.push({ name: '设计最好', importance: 8 });
    }
    
    return [...specificDimensions, ...commonDimensions];
  }

  // 为每个三级品类生成价格区间
  function generatePriceRanges(itemName) {
    // 默认价格区间
    let ranges = [
      { name: '入门', min: 0, max: 99 },
      { name: '中端', min: 100, max: 299 },
      { name: '高端', min: 300, max: 599 },
      { name: '旗舰', min: 600, max: 999999 }
    ];
    
    // 根据品类调整价格区间
    if (itemName.includes('手机') || itemName.includes('电脑') || itemName.includes('平板')) {
      ranges = [
        { name: '入门', min: 0, max: 999 },
        { name: '中端', min: 1000, max: 2999 },
        { name: '高端', min: 3000, max: 4999 },
        { name: '旗舰', min: 5000, max: 999999 }
      ];
    } else if (itemName.includes('耳机')) {
      ranges = [
        { name: '入门', min: 0, max: 99 },
        { name: '中端', min: 100, max: 499 },
        { name: '高端', min: 500, max: 999 },
        { name: '旗舰', min: 1000, max: 999999 }
      ];
    } else if (itemName.includes('鞋') && !itemName.includes('跑鞋')) {
      ranges = [
        { name: '入门', min: 0, max: 199 },
        { name: '中端', min: 200, max: 499 },
        { name: '高端', min: 500, max: 999 },
        { name: '旗舰', min: 1000, max: 999999 }
      ];
    } else if (itemName.includes('跑鞋')) {
      ranges = [
        { name: '入门', min: 0, max: 299 },
        { name: '中端', min: 300, max: 599 },
        { name: '高端', min: 600, max: 899 },
        { name: '旗舰', min: 900, max: 999999 }
      ];
    } else if (itemName.includes('T恤') || itemName.includes('衬衫')) {
      ranges = [
        { name: '入门', min: 0, max: 49 },
        { name: '中端', min: 50, max: 149 },
        { name: '高端', min: 150, max: 299 },
        { name: '旗舰', min: 300, max: 999999 }
      ];
    } else if (itemName.includes('内裤')) {
      ranges = [
        { name: '入门', min: 0, max: 19 },
        { name: '中端', min: 20, max: 49 },
        { name: '高端', min: 50, max: 99 },
        { name: '旗舰', min: 100, max: 999999 }
      ];
    } else if (itemName.includes('护肤') || itemName.includes('精华')) {
      ranges = [
        { name: '入门', min: 0, max: 99 },
        { name: '中端', min: 100, max: 299 },
        { name: '高端', min: 300, max: 599 },
        { name: '旗舰', min: 600, max: 999999 }
      ];
    } else if (itemName.includes('震动棒') || itemName.includes('跳蛋')) {
      ranges = [
        { name: '入门', min: 0, max: 99 },
        { name: '中端', min: 100, max: 199 },
        { name: '高端', min: 200, max: 399 },
        { name: '旗舰', min: 400, max: 999999 }
      ];
    } else if (itemName.includes('飞机杯')) {
      ranges = [
        { name: '入门', min: 0, max: 49 },
        { name: '中端', min: 50, max: 149 },
        { name: '高端', min: 150, max: 299 },
        { name: '旗舰', min: 300, max: 999999 }
      ];
    }
    
    return ranges;
  }

  // 生成所有品类
  allLevel2Groups.forEach(group => {
    const level1 = group.level1;
    group.level2List.forEach(level2 => {
      level2.items.forEach(item => {
        const slug = generateUniqueSlug(item, level1.name, level2.name);
        
        categories.push({
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
            slug: slug,
            dimensions: generateDimensions(item),
            priceRanges: generatePriceRanges(item)
          }
        });
      });
    });
  });

  return categories;
}

async function seedFullCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 清空现有数据
    await Category.deleteMany({});
    console.log('✅ Cleared existing categories');

    // 生成完整品类
    const categories = generateCategories();
    console.log(`📊 Generated ${categories.length} unique categories`);

    // 批量插入
    const batchSize = 100;
    let successCount = 0;
    
    for (let i = 0; i < categories.length; i += batchSize) {
      const batch = categories.slice(i, i + batchSize);
      try {
        await Category.insertMany(batch, { ordered: false });
        successCount += batch.length;
        console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(categories.length/batchSize)} (${successCount}/${categories.length})`);
      } catch (batchError) {
        console.log(`⚠️  Batch ${Math.floor(i/batchSize) + 1} had some duplicates, continuing...`);
        // 尝试逐个插入
        for (const cat of batch) {
          try {
            await Category.create(cat);
            successCount++;
          } catch (singleError) {
            // 跳过重复项
          }
        }
        console.log(`   Inserted ${successCount - (i)}/${batch.length} from this batch`);
      }
    }

    const finalCount = await Category.countDocuments();
    const level1Count = await Category.distinct('level1.name').then(arr => arr.length);
    const level2Count = await Category.distinct('level2.name').then(arr => arr.length);

    console.log('\n📊 Final Statistics:');
    console.log(`   Level1: ${level1Count}`);
    console.log(`   Level2: ${level2Count}`);
    console.log(`   Level3: ${finalCount}`);
    console.log(`   Total: ${finalCount} unique product categories`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedFullCategories();
