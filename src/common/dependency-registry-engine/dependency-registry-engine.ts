import { ModuleRef } from "@nestjs/core";
import { InstanceOf } from "discordx";

import { IDependencyRegistryEngine } from "discordx";
import { Logger } from "../logger/logger.js";

export class DependencyRegistryEngine implements IDependencyRegistryEngine {
  private readonly logger = new Logger(DependencyRegistryEngine.name);

  constructor(private moduleRef: ModuleRef) {}

  addService(): void {
    // Not needed.
  }

  clearAllServices(): void {
    // Not needed.
  }

  getAllServices(): Set<unknown> {
    // Not needed.
    return new Set();
  }

  /**
   * Get a service from the NestJS IOC container.
   * @param classType The class type of the service to retrieve.
   * @returns The instance of the requested service, or null if not found.
   */
  getService<T>(classType: T): InstanceOf<T> | null {
    try {
      return this.moduleRef.get(classType as new (...args: unknown[]) => T);
    } catch (error: unknown) {
      this.logger.error("Could not get service class: [%s]. Error: [%s]", classType, error);

      return null;
    }
  }
}
