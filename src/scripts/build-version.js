import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 生成版本信息
 */
export function versionInfo() {
  const filePath = 'dist/version-info.json';
  try {
    // 获取 Git 信息（仅在构建时需要 Git）
    const commitHash = execSync('git rev-parse HEAD').toString().trim();
    const commitDate = execSync('git log -1 --format=%cd').toString().trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    let tag = 'no-tag';
    const hasTags = execSync('git tag').toString().trim();
    if (hasTags) {
      tag = execSync('git describe --tags --abbrev=0').toString().trim();
    }

    const versionInfo = {
      env: process.env.NODE_ENV,
      commitHash,
      commitDate,
      branch,
      tag,
      buildDate: new Date().toISOString(),
    };

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(versionInfo, null, 2));
  } catch (error) {
    console.error('Failed to generate git version info:', error);
    fs.writeFileSync(filePath, JSON.stringify({}));
  }

  const version = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(version);
}
