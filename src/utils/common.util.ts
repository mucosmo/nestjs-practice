import * as fs from 'fs';
export class CommonUtil {
  /**
   * 延迟指定的时间
   * @param ms 延迟的时间，单位是毫秒
   * @returns
   */
  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * 获取项目版本信息（静态数据，构建时生成）
   */
  static versionInfo() {
    const filePath = 'version-info.json';
    if (!fs.existsSync(filePath)) return null;
    const versionInfo = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(versionInfo);
  }
}
