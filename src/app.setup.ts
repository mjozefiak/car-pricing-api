import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';

export default (app: INestApplication) => {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(
    session({
      secret: process.env.ACCESS_KEY,
      resave: false,
      saveUninitialized: false,
    }),
  );
};
