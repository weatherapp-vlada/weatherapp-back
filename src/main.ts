import { MikroORM } from '@mikro-orm/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

import { AppModule } from './app.module';
import { PgBossTransportStrategy } from './pgboss/pgboss-strategy';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Weather app')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const orm = app.get(MikroORM);
  const migrations = await orm.getMigrator().up();
  logger.log(
    { migrations: migrations.map((m) => m.name) },
    'Migrations executed successfully.',
  );

  const configService = await app.get(ConfigService);

  app.connectMicroservice({
    strategy: new PgBossTransportStrategy(configService),
  });

  app.enableCors();
  await app.startAllMicroservices();
  await app.listen(3000);
}

bootstrap();
