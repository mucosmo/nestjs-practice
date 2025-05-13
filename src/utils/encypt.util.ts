import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ConfigEnum } from 'src/constants/config.constant';

@Injectable()
export class EncryptUtil {
  private keyCache = new Map<string, Buffer>();

  constructor(private configService: ConfigService) {}

  private async getKey(password: string, salt: string): Promise<Buffer> {
    const cacheKey = `${password}:${salt}`;
    if (!this.keyCache.has(cacheKey)) {
      const key = (await promisify(scrypt)(password, salt, 32)) as Buffer;
      this.keyCache.set(cacheKey, key);
    }
    return this.keyCache.get(cacheKey)!;
  }

  /**
   * 加密文本
   * @param textToEncrypt 要加密的文本
   * @param [algorithm='aes-256-ctr'] 加密算法
   */
  async encypt(textToEncrypt: string, algorithm = 'aes-256-ctr'): Promise<any> {
    const iv = randomBytes(16);
    const { encryptPassword, encryptSalt } = this.configService.get(ConfigEnum.APP);
    const key = await this.getKey(encryptPassword, encryptSalt);
    const cipher = createCipheriv(algorithm, key, iv);
    const encryptedText = Buffer.concat([cipher.update(textToEncrypt), cipher.final()]);
    return { data: encryptedText, iv };
  }

  /**
   * 解密文本
   * @param encryptedText 要解密的文本
   * @param [algorithm='aes-256-ctr'] 解密算法
   */
  async decrypt(encryptedText: Buffer, iv: Buffer, algorithm = 'aes-256-ctr'): Promise<string> {
    const { encryptPassword, encryptSalt } = this.configService.get(ConfigEnum.APP);
    const key = await this.getKey(encryptPassword, encryptSalt);
    const decipher = createDecipheriv(algorithm, key, iv);
    const decryptedText = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decryptedText.toString();
  }
}
