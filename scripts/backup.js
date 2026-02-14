#!/usr/bin/env node
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 备份配置
const BACKUP_DIR = path.join(__dirname, '../backups');
const MAX_BACKUPS = 10; // 保留最近10个备份

// 确保备份目录存在
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 生成备份文件名
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupName = `backup-${timestamp}`;
const backupPath = path.join(BACKUP_DIR, backupName);

console.log('📦 开始备份数据库...');
console.log(`📁 备份路径: ${backupPath}`);

// 从 .env 读取数据库连接字符串
const mongoUri = process.env.MONGODB_URI;
const dbName = mongoUri.split('/').pop().split('?')[0];

// 执行 mongodump
exec(`mongodump --uri="${mongoUri}" --out="${backupPath}"`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ 备份失败:', error);
    return;
  }
  
  console.log('✅ 备份成功!');
  console.log(`📊 数据库: ${dbName}`);
  console.log(`🕒 时间: ${new Date().toLocaleString()}`);
  
  // 清理旧备份
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup-'))
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(BACKUP_DIR, f)).birthtime
    }))
    .sort((a, b) => b.time - a.time);
  
  if (backups.length > MAX_BACKUPS) {
    const toDelete = backups.slice(MAX_BACKUPS);
    toDelete.forEach(b => {
      const fullPath = path.join(BACKUP_DIR, b.name);
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`🗑️ 删除旧备份: ${b.name}`);
    });
  }
  
  console.log(`\n💡 可用备份列表:`);
  backups.slice(0, 5).forEach((b, i) => {
    console.log(`   ${i+1}. ${b.name} (${b.time.toLocaleString()})`);
  });
});
