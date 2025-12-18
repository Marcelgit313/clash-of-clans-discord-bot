import KeyvSqlite from "@keyv/sqlite";
import { Injectable, OnModuleInit } from "@nestjs/common";
import config from "config";
import Keyv from "keyv";
import { Logger } from "../logger/logger.js";

const SERVICES_CACHE_URL = config.get<string>("cache.url");

@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name);

  private store: Keyv;

  onModuleInit(): void {
    this.logger.log("Initializing Cache url=[%s]", SERVICES_CACHE_URL);

    this.store = new Keyv(
      new KeyvSqlite({
        uri: SERVICES_CACHE_URL,
      })
    );

    this.logger.log("Initialized Cache");
  }

  public get<T>(key: string): Promise<T | undefined> {
    return this.store.get<T>(key, { raw: false });
  }
  public set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    return this.store.set<T>(key, value, ttl);
  }
  public async delete(key: string | string[]): Promise<boolean> {
    return await this.store.delete(key);
  }
  public async wrap<T>(
    key: string,
    valueGetter: () => T | Promise<T>,
    ttl?: number
  ): Promise<T | undefined> {
    const value = await this.get<T>(key);

    if (value) {
      return value;
    }

    const newValue = await valueGetter();

    await this.set<T>(key, newValue, ttl);

    return newValue;
  }
}
