import { ConfigService } from '@nestjs/config';
import {
  CustomTransportStrategy,
  MessageHandler,
  Server,
} from '@nestjs/microservices';
import * as PgBoss from 'pg-boss';
import { TypeormConfiguration } from 'src/config/db.config';

export class PgBossTransportStrategy
  extends Server
  implements CustomTransportStrategy
{
  private boss: PgBoss;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async listen(callback: () => void) {
    if (this.boss) {
      return;
    }

    const {
      host,
      username: user,
      password,
      database,
      port,
    } = this.configService.get<TypeormConfiguration>('database');
    this.boss = new PgBoss({
      host,
      user,
      password,
      database,
      port,
    });

    this.boss.on('error', (error) => this.logger.error({ error }));

    await this.boss.start();

    await Promise.all(
      Array.from(this.messageHandlers, ([pattern, handler]) =>
        this.getHandler(pattern, handler),
      ),
    );

    callback();
  }

  async getHandler(
    pattern: string,
    handler: MessageHandler<any, any, any>,
  ): Promise<any> {
    if (handler.isEventHandler) {
      return this.boss.work(pattern, handler);
    }

    throw new Error('Method not implemented.');
  }

  async close() {
    await this.boss.stop();
  }
}
