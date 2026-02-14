require('dotenv').config();

async function testQwen() {
  const API_KEY = process.env.QWEN_API_KEY;
  console.log('使用API Key前缀:', API_KEY ? API_KEY.substring(0, 10) + '...' : '未设置');
  
  const prompt = '请用一句话介绍你自己';
  
  try {
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-max',
        input: {
          messages: [
            { role: 'user', content: prompt }
          ]
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 100,
          result_format: 'message'
        }
      })
    });
    
    console.log('响应状态:', response.status);
    const data = await response.json();
    console.log('响应数据:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testQwen();
