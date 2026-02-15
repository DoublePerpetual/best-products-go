import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    // 读取JSON文件
    const filePath = path.join(process.cwd(), 'public/data/global-categories-expanded.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    // 返回数据
    res.status(200).json(data.categories || data);
  } catch (error) {
    console.error('Error reading categories:', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
}
