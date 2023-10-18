import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ReportController } from './report/report.controller';
import { ReportService } from './report/report.service';
import { ReportModule } from './report/report.module';

@Module({
  imports: [UserModule, ReportModule],
  controllers: [AppController, ReportController],
  providers: [AppService, ReportService],
})
export class AppModule {}
