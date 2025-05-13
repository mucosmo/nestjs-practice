import { Module } from '@nestjs/common';

import { CaslModule } from 'src/casl/casl.module';

import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

@Module({
  imports: [CaslModule],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
