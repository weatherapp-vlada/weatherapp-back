import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import * as PgBoss from 'pg-boss';

import { TypeormConfiguration } from '../config/db.config';

export type Options = PgBoss.JobOptions;

export type ConstructorOptions = PgBoss.ConstructorOptions;

export interface Payload {
  data: object;
  options: Options;
}

@Injectable()
export class PgBossClient extends ClientProxy {
  private readonly logger = new Logger(PgBossClient.name);
  private boss: PgBoss;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async connect(): Promise<any> {
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
  }

  async close() {
    await this.boss.stop();
  }

  async dispatchEvent({
    pattern,
    data: { data, options },
  }: ReadPacket<Payload>): Promise<any> {
    return this.boss.send(pattern, data, options);
  }

  scheduleEvent({ pattern, cron, data = undefined }) {
    return this.boss.schedule(pattern, cron, data);
  }

  protected publish(
    packet: ReadPacket<any>,
    callback: (packet: WritePacket<any>) => void,
  ): () => void {
    throw new Error('Method not implemented.');
  }
}
