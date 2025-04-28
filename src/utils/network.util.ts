import { networkInterfaces } from 'os';

export class NetworkUtil {
  /**
   * 获取本服务的 origin 地址
   * @param port 端口号
   * @returns
   */
  static getOrigin(port: number): string {
    const nets = networkInterfaces();
    const results = Object.create(null);

    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        // 跳过内部接口和非 IPv4 地址
        if (!net.internal && net.family === 'IPv4') {
          if (!results[name]) {
            results[name] = [];
          }
          results[name].push(net.address);
        }
      }
    }

    let localIp = 'localhost';
    // 选择第一个可用的内网 IP
    for (const name of Object.keys(results)) {
      if (results[name] && results[name].length > 0) {
        localIp = results[name][0];
        break;
      }
    }

    return `http://${localIp}:${port}`;
  }
}
