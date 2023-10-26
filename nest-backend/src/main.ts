import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WrapResponseInterceptor } from './common/interceptor/wrap-response.interceptor';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Response 를 JSend 방식으로 변형하는 interceptor 적용.
  app.useGlobalInterceptors(new WrapResponseInterceptor());

  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get('PORT') || 3000;
  const NODE_ENV = configService.get('NODE_ENV');
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://valps.gg',
      'https://dev.valps.gg',
      'https://prod.valps.gg',
    ],
  });
  //개발단계에서는 Swagger변경 가능하게 해뒀습니다.
  // if (NODE_ENV !== 'prod') {
  // }
  const swaggerConfig = new DocumentBuilder()
    .setTitle('VALPS Web')
    .setDescription('The VALPS Web API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    ignoreGlobalPrefix: false,
  });
  SwaggerModule.setup('/ps-docs', app, document);

  await app.listen(port);
  console.log(`Listening on port ${port}`);
}
bootstrap();
