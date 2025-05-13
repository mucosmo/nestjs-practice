import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const filePath = 'version-info.json';

try {
  // 获取 Git 信息（仅在构建时需要 Git）
  const commitHash = execSync('git rev-parse HEAD').toString().trim();
  const commitDate = execSync('git log -1 --format=%cd').toString().trim();
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  const tag = execSync('git describe --tags --abbrev=0 || echo "no-tag"').toString().trim();

  const versionInfo = {
    commitHash,
    commitDate,
    branch,
    tag,
    buildDate: new Date().toISOString(),
  };

  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  // 写入为静态文件
  fs.writeFileSync(filePath, JSON.stringify(versionInfo, null, 2));
} catch (error) {
  console.error('Failed to generate git version info:', error.message);
  // 写入默认版本信息
  fs.writeFileSync(filePath, JSON.stringify({}));
}
