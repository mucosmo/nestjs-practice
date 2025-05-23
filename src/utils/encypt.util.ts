import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { ConfigEnum } from 'src/constants/config.constant';

@Injectable()
export class EncryptUtil {
  private keyCache = new Map<string, Buffer>();
  private password: string;
  private salt: string; // should be different for each user, can be stored in the database

  constructor(private configService: ConfigService) {
    const { encryptPassword, encryptSalt } = this.configService.get(ConfigEnum.APP);
    this.password = encryptPassword;
    this.salt = encryptSalt;
  }

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
    const key = await this.getKey(this.password, this.salt);
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
    const key = await this.getKey(this.password, this.salt);
    const decipher = createDecipheriv(algorithm, key, iv);
    const decryptedText = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decryptedText.toString();
  }

  /**
   * 对密码进行哈希运算
   * @param password 进行哈希运算的密码
   */
  async hash(password: string): Promise<string> {
    const saltOrRounds = 10;
    //The result string containing: algorithm identifier, cost factor, salt, and hash
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }

  /**
   * 比较密码和哈希值
   * @param password 要比较的密码
   * @param hash 要比较的哈希值
   */
  async compare(password: string, hash: string): Promise<boolean> {
    const result = await bcrypt.compare(password, hash);
    return result;
  }
}
