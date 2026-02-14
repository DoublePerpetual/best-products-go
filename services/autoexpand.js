require('dotenv').config();
const { connectDB } = require('../lib/db');
const Category = require('../lib/models/Category');
const Answer = require('../lib/models/Answer');

// 配置
const QWEN_API_KEY = process.env.QWEN_API_KEY;

// 每轮最大生成数量
const MAX_PER_RUN = parseInt(process.env.AUTOEXPAND_MAX_PER_RUN || '20');
// 每条间隔（毫秒）
const INTERVAL_MS = parseInt(process.env.AUTOEXPAND_INTERVAL_MS || '3000');
// 每轮间隔（毫秒）- 默认1小时
const LOOP_INTERVAL_MS = parseInt(process.env.AUTOEXPAND_LOOP_INTERVAL_MS || (60 * 60 * 1000).toString());

const fetchFn = global.fetch;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 收集缺失的答案槽位
 */
async function collectMissingSlots() {
  const slots = [];
  const categories = await Category.find({});
  
  for (const category of categories) {
    const { level1, level2, level3 } = category;
    
    for (const dimension of level3.dimensions || []) {
      for (const priceRange of level3.priceRanges || []) {
        const existing = await Answer.findOne({
          categoryId: category._id,
          dimension: dimension.name,
          'priceRange.name': priceRange.name
        });
        
        if (!existing) {
          slots.push({
            categoryId: category._id,
            level1: level1.name,
            level2: level2.name,
            level3: level3.name,
            dimension: dimension.name,
            priceRange,
            region: level1.region === 'both' ? 'global' : level1.region
          });
        }
      }
    }
  }
  
  return slots;
}

/**
 * 调用通义千问生成答案
 */
async function callQwen(slot) {
  if (!QWEN_API_KEY) {
    console.log('❌ 未配置 QWEN_API_KEY');
    return null;
  }
  
  const prompt = buildPrompt(slot);
  console.log(`📝 调用Qwen生成: ${slot.level3} - ${slot.dimension}`);
  
  try {
    const response = await fetchFn('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-max',
        input: {
          messages: [
            { role: 'system', content: '你是一个专业的商品评测专家，请根据要求返回JSON格式的数据。' },
            { role: 'user', content: prompt }
          ]
        },
        parameters: {
          temperature: 0.8,
          max_tokens: 2000,
          result_format: 'message'
        }
      })
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const content = data?.output?.choices?.[0]?.message?.content;
    if (!content) {
      return null;
    }
    
    return parseAIResponse(content);
  } catch (error) {
    console.error('❌ Qwen调用失败:', error.message);
    return null;
  }
}

/**
 * 构建提示词
 */
function buildPrompt(slot) {
  const { level1, level2, level3, dimension, priceRange } = slot;
  
  return `你是一个专业的商品评测编辑，为"全球最佳商品百科全书"撰写内容。

请你在「${level1} > ${level2} > ${level3}」这个品类下，评选出在「${dimension}」这个维度上综合表现最好的单品。

价格要求：${priceRange.name}（${priceRange.min}-${priceRange.max}元）

请严格按照以下JSON格式返回：
{
  "product": {
    "name": "产品完整名称",
    "brand": "品牌名称",
    "price": 价格数字
  },
  "recommendation": {
    "summary": "一句话总结",
    "detailed": "详细推荐理由",
    "pros": ["优点1", "优点2", "优点3"],
    "cons": ["缺点1", "缺点2"]
  }
}`;
}

/**
 * 解析AI返回的JSON
 */
function parseAIResponse(text) {
  let raw = text.trim();
  
  if (raw.startsWith('```')) {
    raw = raw.replace(/```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
  }
  
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    raw = jsonMatch[0];
  }
  
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('❌ JSON解析失败');
    return null;
  }
}

/**
 * 生成答案
 */
async function generateAnswer(slot) {
  console.log('尝试Qwen...');
  const result = await callQwen(slot);
  
  if (!result) {
    throw new Error('Qwen调用失败');
  }
  
  // 直接使用 new Answer() 而不是 create()
  const answer = new Answer({
    categoryId: slot.categoryId,
    level1: slot.level1,
    level2: slot.level2,
    level3: slot.level3,
    dimension: slot.dimension,
    priceRange: {
      name: slot.priceRange.name,
      min: slot.priceRange.min,
      max: slot.priceRange.max
    },
    product: {
      name: result.product?.name || `${slot.level3} 最佳选择`,
      brand: result.product?.brand || '知名品牌',
      price: {
        value: result.product?.price || Math.floor((slot.priceRange.min + slot.priceRange.max) / 2)
      }
    },
    recommendation: {
      summary: result.recommendation?.summary || `这是${slot.level3}的最佳选择`,
      detailed: result.recommendation?.detailed || '经过详细评测，这款产品表现优异。',
      pros: result.recommendation?.pros || ['性能优秀', '做工精良'],
      cons: result.recommendation?.cons || ['价格偏高']
    },
    region: slot.region,
    aiGenerated: {
      provider: 'qwen',
      model: 'qwen-max'
    }
  });
  
  console.log('💾 保存到数据库...');
  await answer.save();
  console.log(`✅ 保存成功，ID: ${answer._id}`);
  return answer;
}

/**
 * 主循环
 */
async function expandAnswers() {
  console.log('🚀 Qwen自动扩量引擎启动');
  
  try {
    await connectDB();
    
    const slots = await collectMissingSlots();
    console.log(`📊 当前缺失槽位: ${slots.length} 个`);
    
    if (slots.length === 0) {
      console.log('✅ 所有槽位已填满');
    } else {
      const batch = slots.slice(0, MAX_PER_RUN);
      console.log(`🎯 本轮计划生成: ${batch.length} 个`);
      
      let success = 0;
      
      for (let i = 0; i < batch.length; i++) {
        const slot = batch[i];
        console.log(`\n[${i+1}/${batch.length}] 生成: ${slot.level1} > ${slot.level2} > ${slot.level3} > ${slot.dimension} (${slot.priceRange.name})`);
        
        try {
          const answer = await generateAnswer(slot);
          console.log(`✅ 生成成功: ${answer.product.name}`);
          success++;
        } catch (error) {
          console.error(`❌ 生成失败: ${error.message}`);
        }
        
        await sleep(INTERVAL_MS);
      }
      
      console.log(`\n📈 本轮完成: 成功 ${success}/${batch.length}`);
    }
    
    const totalAnswers = await Answer.countDocuments();
    console.log(`📊 当前总答案数: ${totalAnswers}`);
    
  } catch (error) {
    console.error('❌ 扩量引擎运行异常:', error);
  }
  
  console.log(`⏰ ${LOOP_INTERVAL_MS/1000/60}分钟后开始下一轮`);
  setTimeout(expandAnswers, LOOP_INTERVAL_MS);
}

if (require.main === module) {
  expandAnswers();
}

module.exports = expandAnswers;
