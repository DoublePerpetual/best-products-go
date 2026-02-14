require('dotenv').config();
const express = require('express');
const { connectDB } = require('./lib/db');
const Category = require('./lib/models/Category');
const Answer = require('./lib/models/Answer');
const expandAnswers = require('./services/autoexpand');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// ========== API Routes ==========

// 获取所有品类
app.get('/api/categories', async (req, res) => {
  try {
    await connectDB();
    const { region = 'all', level1, page = 1, limit = 100 } = req.query;
    
    const query = {};
    if (region !== 'all') {
      query['level1.region'] = { $in: [region, 'both'] };
    }
    if (level1 && level1 !== 'all') {
      query['level1.name'] = level1;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const categories = await Category.find(query)
      .sort({ 'level1.name': 1, 'level2.name': 1, 'level3.name': 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Category.countDocuments(query);
    
    const categoriesWithStats = await Promise.all(
      categories.map(async (cat) => {
        const answerCount = await Answer.countDocuments({ categoryId: cat._id });
        const answers = await Answer.find({ categoryId: cat._id }).limit(1);
        return {
          ...cat.toObject(),
          answerCount,
          hasAnswer: answerCount > 0,
          previewAnswer: answers[0] || null
        };
      })
    );
    
    res.json({
      success: true,
      data: categoriesWithStats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取一级目录
app.get('/api/level1', async (req, res) => {
  try {
    await connectDB();
    const level1s = await Category.distinct('level1.name');
    const result = await Promise.all(
      level1s.map(async (name) => {
        const count = await Category.countDocuments({ 'level1.name': name });
        const sample = await Category.findOne({ 'level1.name': name });
        return {
          name,
          slug: sample?.level1.slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          icon: sample?.level1.icon || 'fa-box',
          region: sample?.level1.region || 'both',
          count
        };
      })
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取二级目录
app.get('/api/level2', async (req, res) => {
  try {
    await connectDB();
    const { level1 } = req.query;
    
    const query = {};
    if (level1) {
      query['level1.name'] = level1;
    }
    
    const level2s = await Category.distinct('level2.name', query);
    const result = await Promise.all(
      level2s.map(async (name) => {
        const count = await Category.countDocuments({ 'level2.name': name, ...query });
        const sample = await Category.findOne({ 'level2.name': name, ...query });
        return {
          name,
          slug: sample?.level2.slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          icon: sample?.level2.icon || 'fa-folder',
          count
        };
      })
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== 修复后的搜索API ==========
app.get('/api/search', async (req, res) => {
  try {
    await connectDB();
    const { q } = req.query;
    
    if (!q) {
      return res.json({ success: true, data: [] });
    }
    
    const categories = await Category.find({
      $or: [
        { 'level3.name': { $regex: q, $options: 'i' } },
        { 'level2.name': { $regex: q, $options: 'i' } },
        { 'level1.name': { $regex: q, $options: 'i' } }
      ]
    }).limit(100);
    
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取统计
app.get('/api/stats', async (req, res) => {
  try {
    await connectDB();
    const level1 = await Category.distinct('level1.name').then(arr => arr.length);
    const level2 = await Category.distinct('level2.name').then(arr => arr.length);
    const level3 = await Category.countDocuments();
    const answers = await Answer.countDocuments();
    
    res.json({
      success: true,
      data: { level1, level2, level3, answers }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个品类
app.get('/api/category/:id', async (req, res) => {
  try {
    await connectDB();
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, error: '品类不存在' });
    }
    
    const answers = await Answer.find({ categoryId: category._id });
    
    const answersByPriceRange = {};
    category.level3.priceRanges?.forEach(range => {
      answersByPriceRange[range.name] = answers.filter(a => a.priceRange.name === range.name);
    });
    
    res.json({
      success: true,
      data: { category, answers: answersByPriceRange }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取单个答案
app.get('/api/answer/:id', async (req, res) => {
  try {
    await connectDB();
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ success: false, error: '答案不存在' });
    }
    
    res.json({ success: true, data: answer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 投票
app.post('/api/vote', async (req, res) => {
  try {
    await connectDB();
    const { answerId, type } = req.body;
    
    const update = type === 'like' 
      ? { $inc: { 'feedback.likes': 1 } }
      : { $inc: { 'feedback.dislikes': 1 } };
    
    const answer = await Answer.findByIdAndUpdate(
      answerId,
      update,
      { new: true }
    );
    
    res.json({
      success: true,
      data: {
        likes: answer.feedback.likes,
        dislikes: answer.feedback.dislikes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 评论
app.post('/api/comment', async (req, res) => {
  try {
    await connectDB();
    const { answerId, user, content } = req.body;
    
    const answer = await Answer.findByIdAndUpdate(
      answerId,
      {
        $push: {
          'feedback.comments': {
            user: user || '匿名用户',
            content,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );
    
    res.json({ success: true, data: answer.feedback.comments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== 首页路由 ==========
app.get('/', async (req, res) => {
  try {
    await connectDB();
    
    const view = req.query.view || 'grid';
    const region = req.query.region || 'all';
    const search = req.query.search || '';
    const level1 = req.query.level1 || 'all';
    const level2 = req.query.level2 || 'all';
    const page = parseInt(req.query.page || '1');
    const limit = 100;
    
    // 获取统计
    const stats = {
      level1: await Category.distinct('level1.name').then(arr => arr.length),
      level2: await Category.distinct('level2.name').then(arr => arr.length),
      level3: await Category.countDocuments(),
      answers: await Answer.countDocuments()
    };
    
    // 获取一级目录
    const level1s = await Category.distinct('level1.name');
    
    // 获取二级目录
    let level2s = [];
    if (level1 !== 'all') {
      level2s = await Category.distinct('level2.name', { 'level1.name': level1 });
    }
    
    // 构建查询条件
    const query = {};
    if (region !== 'all') {
      query['level1.region'] = { $in: [region, 'both'] };
    }
    if (level1 !== 'all') {
      query['level1.name'] = level1;
    }
    if (level2 !== 'all') {
      query['level2.name'] = level2;
    }
    
    // ========== 修复后的搜索逻辑 ==========
    let categories = [];
    let total = 0;
    let totalPages = 1;
    
    if (search) {
      // 搜索模式：搜索所有字段
      categories = await Category.find({
        $or: [
          { 'level3.name': { $regex: search, $options: 'i' } },
          { 'level2.name': { $regex: search, $options: 'i' } },
          { 'level1.name': { $regex: search, $options: 'i' } }
        ]
      }).sort({ 'level1.name': 1, 'level2.name': 1, 'level3.name': 1 });
      
      total = categories.length;
    } else {
      // 非搜索模式
      if (view === 'grid') {
        categories = await Category.find(query)
          .sort({ 'level1.name': 1, 'level2.name': 1, 'level3.name': 1 });
        total = categories.length;
      } else {
        const skip = (page - 1) * limit;
        total = await Category.countDocuments(query);
        totalPages = Math.ceil(total / limit);
        
        categories = await Category.find(query)
          .sort({ 'level1.name': 1, 'level2.name': 1, 'level3.name': 1 })
          .skip(skip)
          .limit(limit);
      }
    }
    
    const categoriesWithAnswers = await Promise.all(
      categories.map(async (cat) => {
        const answers = await Answer.find({ categoryId: cat._id }).limit(1);
        return {
          ...cat.toObject(),
          answers,
          answerCount: answers.length
        };
      })
    );
    
    // 渲染卡片模式
    const renderGrid = () => {
      let html = '';
      const grouped = {};
      
      categoriesWithAnswers.forEach(cat => {
        const l1 = cat.level1.name;
        if (!grouped[l1]) {
          grouped[l1] = {
            icon: cat.level1.icon,
            expanded: level1 === l1,
            level2s: {}
          };
        }
        const l2 = cat.level2.name;
        if (!grouped[l1].level2s[l2]) {
          grouped[l1].level2s[l2] = {
            icon: cat.level2.icon,
            expanded: level2 === l2,
            items: []
          };
        }
        grouped[l1].level2s[l2].items.push(cat);
      });
      
      for (const l1 in grouped) {
        const l1Data = grouped[l1];
        const expandedClass = l1Data.expanded ? '' : 'hidden';
        
        html += `<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div class="bg-gray-50 px-6 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition" 
               onclick="toggleLevel1('${l1}')">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-gray-800">
                <i class="fa-solid ${l1Data.icon} text-blue-500 mr-2"></i>
                ${l1} <span class="text-sm font-normal text-gray-500 ml-2">(${Object.keys(l1Data.level2s).length}个子类)</span>
              </h2>
              <i class="fa-solid fa-chevron-${l1Data.expanded ? 'up' : 'down'} text-gray-400"></i>
            </div>
          </div>
          <div id="level1-${l1}" class="p-6 ${expandedClass}">`;
        
        for (const l2 in l1Data.level2s) {
          const l2Data = l1Data.level2s[l2];
          const l2ExpandedClass = l2Data.expanded ? '' : 'hidden';
          
          html += `<div class="mb-4 last:mb-0">
            <div class="flex items-center justify-between mb-2 cursor-pointer hover:text-blue-600" 
                 onclick="toggleLevel2('${l1}', '${l2}')">
              <h3 class="text-md font-bold text-gray-700">
                <i class="fa-solid ${l2Data.icon} text-purple-500 mr-2"></i>
                ${l2} <span class="text-sm font-normal text-gray-500 ml-2">(${l2Data.items.length}个品类)</span>
              </h3>
              <i class="fa-solid fa-chevron-${l2Data.expanded ? 'up' : 'down'} text-gray-400 text-sm"></i>
            </div>
            <div id="level2-${l1}-${l2}" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${l2ExpandedClass}">`;
          
          l2Data.items.forEach(cat => {
            const hasAnswers = cat.answers.length > 0;
            html += `<div onclick="location.href='/category/${cat._id}'"
              class="bg-white rounded-xl p-4 border border-gray-100 ${hasAnswers ? 'cursor-pointer hover:shadow-md' : 'opacity-60'}">
              <div class="flex justify-between items-start mb-2">
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  ${cat.level3.dimensions?.length || 0}个维度
                </span>
                ${hasAnswers 
                  ? `<span class="text-xs text-green-600">${cat.answers.length}个答案</span>`
                  : '<span class="text-xs text-gray-400">暂无答案</span>'}
              </div>
              <h4 class="font-bold text-gray-900">${cat.level3.name}</h4>
              ${hasAnswers ? `
                <div class="mt-2 text-xs text-gray-500 line-clamp-2">
                  🏆 ${cat.answers[0].product.name}
                </div>
              ` : ''}
              <div class="mt-2 flex flex-wrap gap-1">
                ${cat.level3.dimensions?.slice(0, 3).map(d => 
                  `<span class="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">${d.name}</span>`
                ).join('')}
              </div>
            </div>`;
          });
          
          html += `</div></div>`;
        }
        
        html += `</div></div>`;
      }
      
      return html;
    };
    
    // 渲染列表模式
    const renderList = () => {
      let html = '';
      const grouped = {};
      
      categoriesWithAnswers.forEach(cat => {
        const l1 = cat.level1.name;
        if (!grouped[l1]) {
          grouped[l1] = {
            icon: cat.level1.icon,
            level2s: {}
          };
        }
        const l2 = cat.level2.name;
        if (!grouped[l1].level2s[l2]) {
          grouped[l1].level2s[l2] = [];
        }
        grouped[l1].level2s[l2].push(cat);
      });
      
      for (const l1 in grouped) {
        const l1Data = grouped[l1];
        
        html += `<div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div class="bg-gray-50 px-6 py-3 border-b border-gray-100">
            <h2 class="text-lg font-bold text-gray-800">
              <i class="fa-solid ${l1Data.icon} text-blue-500 mr-2"></i>
              ${l1}
            </h2>
          </div>
          <div class="p-6">`;
        
        for (const l2 in l1Data.level2s) {
          const l2Items = l1Data.level2s[l2];
          
          html += `<div class="mb-6 last:mb-0">
            <h3 class="text-md font-bold text-gray-700 mb-3 flex items-center">
              <i class="fa-solid fa-folder text-purple-500 mr-2"></i>
              ${l2} <span class="text-sm font-normal text-gray-500 ml-2">(${l2Items.length}个品类)</span>
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">`;
          
          l2Items.forEach(cat => {
            const hasAnswers = cat.answers.length > 0;
            html += `<div onclick="location.href='/category/${cat._id}'"
              class="p-3 bg-white rounded-lg border border-gray-100 ${hasAnswers ? 'cursor-pointer hover:bg-gray-50' : 'opacity-60'}">
              <div class="flex items-start gap-2">
                <i class="fa-solid ${l1Data.icon} text-blue-500 mt-1"></i>
                <div class="flex-1 min-w-0">
                  <div class="text-xs text-gray-400 mb-1">
                    <span>${l1}</span> <i class="fa-solid fa-chevron-right text-[8px] mx-1"></i> <span>${l2}</span>
                  </div>
                  <div class="font-medium truncate">${cat.level3.name}</div>
                  ${hasAnswers ? `
                    <div class="text-xs text-green-600 mt-1 truncate">
                      🏆 ${cat.answers[0].product.name}
                    </div>
                  ` : ''}
                  <div class="flex flex-wrap gap-1 mt-1">
                    ${cat.level3.dimensions?.slice(0, 2).map(d => 
                      `<span class="text-[10px] bg-blue-50 text-blue-700 px-1 py-0.5 rounded">${d.name}</span>`
                    ).join('')}
                  </div>
                </div>
              </div>
            </div>`;
          });
          
          html += `</div></div>`;
        }
        
        html += `</div></div>`;
      }
      
      return html;
    };
    
    // 分页
    const pagination = [];
    if (view === 'list' && totalPages > 1 && !search) {
      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
          pagination.push(i);
        } else if (i === page - 3 || i === page + 3) {
          pagination.push('...');
        }
      }
    }
    
    res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>全球最佳商品百科全书</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .transition { transition: all 0.2s; }
  </style>
</head>
<body class="bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- 头部统计 -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <i class="fa-solid fa-trophy text-yellow-500"></i>
            全球最佳商品百科全书
            <span class="text-sm font-normal text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              ${stats.level3}个品类 · ${stats.answers}个最佳商品
            </span>
          </h1>
          <p class="text-gray-500 mt-1">
            <i class="fa-solid fa-tags text-blue-500"></i>
            一级${stats.level1} · 二级${stats.level2} · 三级${stats.level3}
          </p>
        </div>
        <div class="flex gap-2">
          <div class="flex items-center bg-gray-100 p-1 rounded-lg">
            <a href="/?view=grid&region=${region}&search=${encodeURIComponent(search)}&level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}&page=1"
               class="px-3 py-1.5 rounded-md text-sm ${view === 'grid' ? 'bg-white shadow' : 'text-gray-600'}">
              <i class="fa-solid fa-grid-2"></i> 卡片
            </a>
            <a href="/?view=list&region=${region}&search=${encodeURIComponent(search)}&level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}&page=1"
               class="px-3 py-1.5 rounded-md text-sm ${view === 'list' ? 'bg-white shadow' : 'text-gray-600'}">
              <i class="fa-solid fa-list"></i> 列表
            </a>
          </div>
          <div class="flex items-center bg-gray-100 p-1 rounded-lg">
            <a href="/?view=${view}&region=all&search=${encodeURIComponent(search)}&level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}&page=1"
               class="px-3 py-1.5 rounded-md text-sm ${region === 'all' ? 'bg-white shadow' : 'text-gray-600'}">全部</a>
            <a href="/?view=${view}&region=global&search=${encodeURIComponent(search)}&level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}&page=1"
               class="px-3 py-1.5 rounded-md text-sm ${region === 'global' ? 'bg-white shadow' : 'text-gray-600'}">全球</a>
            <a href="/?view=${view}&region=china&search=${encodeURIComponent(search)}&level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}&page=1"
               class="px-3 py-1.5 rounded-md text-sm ${region === 'china' ? 'bg-white shadow' : 'text-gray-600'}">中国</a>
          </div>
        </div>
      </div>
      
      <form class="flex gap-2 mt-4" method="GET" action="/">
        <input type="hidden" name="view" value="${view}">
        <input type="hidden" name="region" value="${region}">
        <input type="hidden" name="level1" value="${level1}">
        <input type="hidden" name="level2" value="${level2}">
        <input type="hidden" name="page" value="1">
        <input type="text" name="search" placeholder="🔍 搜索品类..." 
               value="${search}"
               class="flex-1 px-5 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-blue-500">
        <button type="submit" class="px-6 py-3 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700">
          搜索
        </button>
      </form>
      
      <div class="flex flex-wrap gap-2 mt-4">
        <a href="/?view=${view}&region=${region}&search=${encodeURIComponent(search)}&level1=all&level2=all&page=1"
           class="px-4 py-2 rounded-full text-sm font-medium ${level1 === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}">
          全部
        </a>
        ${level1s.map(l1 => `
          <a href="/?view=${view}&region=${region}&search=${encodeURIComponent(search)}&level1=${encodeURIComponent(l1)}&level2=all&page=1"
             class="px-4 py-2 rounded-full text-sm font-medium ${level1 === l1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}">
            ${l1}
          </a>
        `).join('')}
      </div>
      
      ${level1 !== 'all' && level2s.length > 0 ? `
        <div class="flex flex-wrap gap-2 mt-3 pl-2 border-l-4 border-purple-500">
          <a href="/?view=${view}&region=${region}&search=${encodeURIComponent(search)}&level1=${encodeURIComponent(level1)}&level2=all&page=1"
             class="px-3 py-1.5 rounded-full text-xs font-medium ${level2 === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}">
            全部二级
          </a>
          ${level2s.map(l2 => `
            <a href="/?view=${view}&region=${region}&search=${encodeURIComponent(search)}&level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(l2)}&page=1"
               class="px-3 py-1.5 rounded-full text-xs font-medium ${level2 === l2 ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}">
              ${l2}
            </a>
          `).join('')}
        </div>
      ` : ''}
    </div>
    
    ${view === 'grid' ? renderGrid() : renderList()}
    
    ${view === 'list' && totalPages > 1 && !search ? `
      <div class="flex justify-center gap-2 mt-8">
        <a href="/?view=${view}&region=${region}&search=${encodeURIComponent(search)}&level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}&page=${Math.max(1, page-1)}"
           class="px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm ${page === 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50'}">
          <i class="fa-solid fa-chevron-left"></i>
        </a>
        
        ${pagination.map(p => 
          p === '...' 
            ? `<span class="px-4 py-2 text-gray-400">...</span>`
            : `<a href="/?view=${view}&region=${region}&search=${encodeURIComponent(search)}&level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}&page=${p}"
                  class="px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm ${page === p ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}">${p}</a>`
        ).join('')}
        
        <a href="/?view=${view}&region=${region}&search=${encodeURIComponent(search)}&level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}&page=${Math.min(totalPages, page+1)}"
           class="px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm ${page === totalPages ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50'}">
          <i class="fa-solid fa-chevron-right"></i>
        </a>
      </div>
    ` : ''}
    
    <div class="mt-8 text-center text-xs text-gray-400">
      <i class="fa-solid fa-robot mr-1"></i>
      自动扩量引擎后台运行中 · 已生成 ${stats.answers} 个最佳答案
    </div>
  </div>
  
  <script>
    function toggleLevel1(level1) {
      const el = document.getElementById('level1-' + level1);
      const icon = event.currentTarget.querySelector('.fa-chevron-down, .fa-chevron-up');
      if (el.classList.contains('hidden')) {
        el.classList.remove('hidden');
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
      } else {
        el.classList.add('hidden');
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
      }
    }
    
    function toggleLevel2(level1, level2) {
      const el = document.getElementById('level2-' + level1 + '-' + level2);
      const icon = event.currentTarget.querySelector('.fa-chevron-down, .fa-chevron-up');
      if (el.classList.contains('hidden')) {
        el.classList.remove('hidden');
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
      } else {
        el.classList.add('hidden');
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
      }
    }
  </script>
</body>
</html>`);
  } catch (error) {
    res.status(500).send('Server Error: ' + error.message);
  }
});

// 品类详情页
app.get('/category/:id', async (req, res) => {
  try {
    await connectDB();
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).send('品类不存在');
    }
    
    const answers = await Answer.find({ categoryId: category._id });
    
    const answersByPriceRange = {};
    category.level3.priceRanges?.forEach(range => {
      answersByPriceRange[range.name] = answers.filter(a => a.priceRange.name === range.name);
    });
    
    res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${category.level3.name} · 全球最佳商品百科全书</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-6">
      <a href="/?level1=${encodeURIComponent(category.level1.name)}&level2=${encodeURIComponent(category.level2.name)}"
         class="text-gray-500 hover:text-gray-700">
        <i class="fa-solid fa-arrow-left"></i> 返回
      </a>
    </div>
    
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div class="flex items-center gap-3 mb-4">
        <span class="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">${category.level1.name}</span>
        <span class="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">${category.level2.name}</span>
        <span class="bg-pink-100 text-pink-800 text-xs px-3 py-1 rounded-full">${category.level3.name}</span>
      </div>
      
      <h1 class="text-3xl font-bold text-gray-900 mb-4">${category.level3.name}</h1>
      
      <div class="flex flex-wrap gap-2 mb-4">
        ${category.level3.dimensions?.map(d => `
          <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
            🏆 ${d.name}
          </span>
        `).join('')}
      </div>
      
      <p class="text-gray-500">
        ✨ ${answers.length} 个最佳答案 · ${category.level3.dimensions?.length || 0} 个评选维度
      </p>
    </div>
    
    ${category.level3.priceRanges?.map(range => `
      <div class="mb-8">
        <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mr-3">
            ${range.name}
          </span>
          <span class="text-sm text-gray-500">¥${range.min} - ${range.max === 999999 ? '以上' : '¥' + range.max}</span>
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${(answersByPriceRange[range.name] || []).map(a => `
            <div onclick="location.href='/answer/${a._id}'"
                 class="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md cursor-pointer">
              <span class="text-sm font-bold text-blue-600">🏆 ${a.dimension}</span>
              <h3 class="text-lg font-bold text-gray-900 mt-2">${a.product.name}</h3>
              <p class="text-sm text-gray-600">${a.product.brand} · ¥${a.product.price?.value || a.product.price}</p>
              <p class="text-xs text-gray-500 line-clamp-2 mt-2">${a.recommendation.summary}</p>
              <div class="mt-3 flex items-center gap-3 text-xs text-gray-400">
                <span><i class="fa-regular fa-thumbs-up mr-1"></i>${a.feedback?.likes || 0}</span>
                <span><i class="fa-regular fa-thumbs-down mr-1"></i>${a.feedback?.dislikes || 0}</span>
                <span><i class="fa-regular fa-comment mr-1"></i>${a.feedback?.comments?.length || 0}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>`);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// 答案详情页
app.get('/answer/:id', async (req, res) => {
  try {
    await connectDB();
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).send('答案不存在');
    }
    
    res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${answer.product.name} · 全球最佳商品百科全书</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50">
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="mb-6">
      <a href="/category/${answer.categoryId}" class="text-gray-500 hover:text-gray-700">
        <i class="fa-solid fa-arrow-left"></i> 返回品类
      </a>
    </div>
    
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center gap-3 mb-4">
        <span class="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">${answer.level1}</span>
        <span class="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">${answer.level2}</span>
        <span class="bg-pink-100 text-pink-800 text-xs px-3 py-1 rounded-full">${answer.level3}</span>
        <span class="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">${answer.dimension}</span>
        <span class="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">${answer.priceRange?.name || ''}</span>
      </div>
      
      <h1 class="text-3xl font-bold text-gray-900 mb-2">${answer.product.name}</h1>
      <p class="text-xl text-gray-600 mb-4">${answer.product.brand} · 参考价 ¥${answer.product.price?.value || answer.product.price}</p>
      
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
        <p class="text-gray-700 whitespace-pre-line">${answer.recommendation?.detailed || answer.recommendation?.summary || ''}</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 class="font-bold text-green-600 mb-3"><i class="fa-regular fa-circle-check mr-2"></i>优点</h3>
          <ul class="space-y-2">
            ${(answer.recommendation.pros || []).map(p => `
              <li class="flex items-start gap-2">
                <i class="fa-solid fa-plus text-green-500 text-xs mt-1"></i>
                <span class="text-sm text-gray-700">${p}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        <div>
          <h3 class="font-bold text-red-600 mb-3"><i class="fa-regular fa-circle-xmark mr-2"></i>缺点</h3>
          <ul class="space-y-2">
            ${(answer.recommendation.cons || []).map(c => `
              <li class="flex items-start gap-2">
                <i class="fa-solid fa-minus text-red-500 text-xs mt-1"></i>
                <span class="text-sm text-gray-700">${c}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
      
      <div class="flex justify-center gap-6 mb-6">
        <button onclick="vote('like')" 
                class="flex items-center gap-2 px-6 py-3 bg-green-50 hover:bg-green-100 rounded-xl transition">
          <i class="fa-solid fa-thumbs-up text-green-600"></i>
          准确 <span id="like-count">${answer.feedback?.likes || 0}</span>
        </button>
        <button onclick="vote('dislike')"
                class="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 rounded-xl transition">
          <i class="fa-solid fa-thumbs-down text-red-600"></i>
          不准确 <span id="dislike-count">${answer.feedback?.dislikes || 0}</span>
        </button>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <a href="https://search.jd.com/Search?keyword=${encodeURIComponent(answer.product.name)}" 
           target="_blank" 
           class="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl text-center transition">
          京东
        </a>
        <a href="https://list.tmall.com/search_product.htm?q=${encodeURIComponent(answer.product.name)}" 
           target="_blank"
           class="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-xl text-center transition">
          天猫
        </a>
        <a href="https://www.amazon.com/s?k=${encodeURIComponent(answer.product.name)}" 
           target="_blank"
           class="bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-xl text-center transition">
          亚马逊
        </a>
        <a href="https://s.taobao.com/search?q=${encodeURIComponent(answer.product.name)}" 
           target="_blank"
           class="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-xl text-center transition">
          淘宝
        </a>
      </div>
      
      <div class="border-t pt-6">
        <h3 class="font-bold text-gray-800 mb-4">
          <i class="fa-regular fa-comments mr-2"></i>
          用户评论 (${answer.feedback?.comments?.length || 0})
        </h3>
        
        <div id="comments-list" class="space-y-4 mb-6">
          ${(answer.feedback?.comments || []).map(c => `
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-medium text-sm">${c.user}</span>
                <span class="text-xs text-gray-400">${new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p class="text-sm text-gray-700">${c.content}</p>
            </div>
          `).join('')}
        </div>
        
        <div class="flex gap-3">
          <input type="text" id="comment-input" placeholder="分享你的看法..." 
                 class="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500">
          <button onclick="addComment()" 
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            发表
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    const answerId = '${answer._id}';
    
    async function vote(type) {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId, type })
      });
      
      const data = await response.json();
      if (data.success) {
        document.getElementById('like-count').textContent = data.data.likes;
        document.getElementById('dislike-count').textContent = data.data.dislikes;
      }
    }
    
    async function addComment() {
      const input = document.getElementById('comment-input');
      const content = input.value.trim();
      if (!content) return;
      
      const response = await fetch('/api/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId, user: '匿名用户', content })
      });
      
      const data = await response.json();
      if (data.success) {
        location.reload();
      }
    }
  </script>
</body>
</html>`);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// 启动自动扩量引擎（暂时禁用）
// if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_AUTOEXPAND) {
//   expandAnswers().catch(console.error);
// }

// 启动服务器
app.listen(PORT, async () => {
  await connectDB();
  console.log(`✅ 服务器启动成功，端口 ${PORT}`);
  console.log(`⚠️  注意：自动扩量引擎已暂时禁用（API欠费），请充值后重新启用`);
});
