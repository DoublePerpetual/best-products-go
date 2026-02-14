#!/usr/bin/env node
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

const BACKUP_DIR = path.join(__dirname, '../backups');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 列出所有备份
console.log('📋 可用备份列表:\n');

const backups = fs.readdirSync(BACKUP_DIR)
  .filter(f => f.startsWith('backup-'))
  .map(f => ({
    name: f,
    path: path.join(BACKUP_DIR, f),
    time: fs.statSync(path.join(BACKUP_DIR, f)).birthtime
  }))
  .sort((a, b) => b.time - a.time);

if (backups.length === 0) {
  console.log('❌ 没有找到备份');
  process.exit(1);
}

backups.forEach((b, i) => {
  console.log(`[${i + 1}] ${b.name} (${b.time.toLocaleString()})`);
});

rl.question('\n请输入要恢复的备份编号: ', (answer) => {
  const index = parseInt(answer) - 1;
  
  if (index < 0 || index >= backups.length) {
    console.log('❌ 无效的编号');
    rl.close();
    return;
  }
  
  const selected = backups[index];
  console.log(`\n⚠️  警告: 恢复将覆盖当前数据库!`);
  console.log(`   备份: ${selected.name}`);
  console.log(`   时间: ${selected.time.toLocaleString()}`);
  
  rl.question('\n确认恢复? (yes/no): ', (confirm) => {
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ 已取消');
      rl.close();
      return;
    }
    
    const mongoUri = process.env.MONGODB_URI;
    
    console.log('\n🔄 开始恢复...');
    
    // 先删除当前数据库
    exec(`mongorestore --uri="${mongoUri}" --drop "${selected.path}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ 恢复失败:', error);
        rl.close();
        return;
      }
      
      console.log('✅ 恢复成功!');
      console.log(`📊 已恢复到: ${selected.name}`);
      
      // 显示当前数据统计
      exec('node -e "const mongoose=require(\'mongoose\');const Category=require(\'./lib/models/Category\');require(\'dotenv\').config();(async()=>{await mongoose.connect(process.env.MONGODB_URI);const count=await Category.countDocuments();console.log(`当前品类数量: ${count}`);await mongoose.disconnect();})()"', (err, stdout) => {
        console.log(stdout);
        rl.close();
      });
    });
  });
});
