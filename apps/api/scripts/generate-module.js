#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('❌ 错误: 请提供模块名称');
  console.log('\n用法: pnpm generate <模块名>');
  console.log('示例: pnpm generate user');
  process.exit(1);
}

console.log(`\n🚀 正在创建模块: ${moduleName}\n`);

// 启动 nest g resource 命令
const child = spawn('npx', ['nest', 'g', 'resource', moduleName], {
  stdio: ['pipe', 'inherit', 'inherit'],
  shell: true,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let questionCount = 0;

// 监听子进程的输入请求
child.stdin.on('drain', () => {
  if (questionCount === 0) {
    // 第一个问题: What transport layer do you use?
    // 自动选择 REST API (选项 0)
    child.stdin.write('0\n');
    questionCount++;
  } else if (questionCount === 1) {
    // 第二个问题: Would you like to generate CRUD entry points?
    // 自动选择 Yes (选项 0)
    child.stdin.write('0\n');
    questionCount++;
  }
});

child.on('close', (code) => {
  rl.close();
  if (code === 0) {
    console.log(`\n✅ 模块 "${moduleName}" 创建成功!\n`);
    console.log('📁 已生成以下文件:');
    console.log(`   - src/${moduleName}/${moduleName}.controller.ts`);
    console.log(`   - src/${moduleName}/${moduleName}.service.ts`);
    console.log(`   - src/${moduleName}/${moduleName}.module.ts`);
    console.log(`   - src/${moduleName}/dto/create-${moduleName}.dto.ts`);
    console.log(`   - src/${moduleName}/dto/update-${moduleName}.dto.ts`);
    console.log(`   - src/${moduleName}/entities/${moduleName}.entity.ts`);
  } else {
    console.error(`\n❌ 模块创建失败，退出码: ${code}`);
    process.exit(code);
  }
});

child.on('error', (err) => {
  console.error('❌ 执行错误:', err);
  rl.close();
  process.exit(1);
});
