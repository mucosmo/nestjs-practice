// src/configs/multer.config.ts
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  protected readonly logger = new Logger(MulterConfigService.name);

  constructor(private configService: ConfigService) {}

  createMulterOptions(): MulterModuleOptions {
    const uploadDir = this.configService.get<string>('UPLOAD_DIR') || './uploads';
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // 可以基于文件类型创建不同的子目录
          const fileType = file.mimetype.split('/')[0];
          const destination = join(uploadDir, fileType);

          if (!existsSync(destination)) {
            mkdirSync(destination, { recursive: true });
          }
          this.logger.log(`File destination directory: ${destination}`);
          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;

          this.logger.log(
            `Generated filename: ${filename} for original file: ${file.originalname}`,
          );
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: this.configService.get('MAX_FILE_SIZE') || 5 * 1024 * 1024, // 默认 5MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedMimeTypes.includes(file.mimetype)) {
          this.logger.log(`File type ${file.mimetype} is allowed`);
          cb(null, true);
        } else {
          this.logger.warn(`Rejected file with unsupported type: ${file.mimetype}`);
          cb(null, true); // 允许所有文件类型，但记录警告
        }
      },
    };
  }
}
