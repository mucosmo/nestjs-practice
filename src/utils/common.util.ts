export class CommonUtil {
  /**
   * 延迟指定的时间
   * @param ms 延迟的时间，单位是毫秒
   * @returns
   */
  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
