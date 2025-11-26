import { Module } from '@nestjs/common';
import { LessonGateway } from './lesson.gateway';

@Module({
  providers: [LessonGateway],
  exports: [LessonGateway],
})
export class WebsocketModule {}
