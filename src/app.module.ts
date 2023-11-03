import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ReportModule } from './report/report.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './user/user.entity';
import { Report } from './report/report.entity';
import { APP_PIPE } from '@nestjs/core';
import { Auth } from './auth/auth.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'sqlite',
          database: config.get('DB_NAME'),
          entities: [User, Report, Auth],
          synchronize: true,
        };
      },
    }),
    UserModule,
    ReportModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true }) },
  ],
})
export class AppModule {
  // constructor(private configService: ConfigService) {}
  //
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(
  //       session({
  //         secret: this.configService.get('ACCESS_TOKEN'),
  //         resave: false,
  //         saveUninitialized: false,
  //       }),
  //     )
  //     .forRoutes('*');
  // }
}
