import type { Env as BaseEnv } from './core-utils';

export interface Env extends BaseEnv {
  DB: D1Database;
}
