import { Module } from '@nestjs/common';

import { PgBossClient } from './pgboss-client';

@Module({
  imports: [],
  providers: [PgBossClient],
  exports: [PgBossClient],
})
export class PgBossModule {}
