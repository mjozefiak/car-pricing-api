import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ReportController } from './report/report.controller';
import { ReportService } from './report/report.service';
import { ReportModule } from './report/report.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [__dirname + '/../**/*.entity.js'],
      synchronize: true,
    }),
    ConfigModule.forRoot(),
    UserModule,
    ReportModule,
    AuthModule,
  ],
  controllers: [AppController, ReportController],
  providers: [
    AppService,
    ReportService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CurrentUserInterceptor,
    },
  ],
})
export class AppModule {}
