/**
 * Service Factory
 *
 * Implements the Factory pattern for service initialization and dependency injection.
 * Manages the lifecycle of services and provides a central point for accessing them.
 */

import { errorHandler } from "../utils/ErrorHandler"
import { logger } from "../utils/Logger"

/**
 * Service interface that all services must implement
 */
export interface Service {
  initialize(): Promise<void>
  destroy?(): Promise<void>
}

/**
 * Service container to hold initialized services
 */
interface ServiceContainer {
  [key: string]: Service
}

/**
 * Service Factory class
 */
class ServiceFactory {
  private services: ServiceContainer = {}
  private initialized = false

  /**
   * Register a service
   */
  register(name: string, service: Service): void {
    if (this.services[name]) {
      logger.warn(`Service ${name} is already registered. Overwriting.`)
    }
    this.services[name] = service
  }

  /**
   * Get a service by name
   */
  get<T extends Service>(name: string): T {
    const service = this.services[name]
    if (!service) {
      throw new Error(`Service ${name} not found`)
    }
    return service as T
  }

  /**
   * Initialize all registered services
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn("ServiceFactory is already initialized")
      return
    }

    logger.info("Initializing services...")
    const startTime = Date.now()

    const initPromises = Object.entries(this.services).map(async ([name, service]) => {
      try {
        await service.initialize()
        logger.debug(`Service ${name} initialized`)
      } catch (error) {
        errorHandler.handle(error as Error, {
          context: "ServiceFactory.initialize",
          service: name,
        })
        // Decide if we should fail hard or continue
        // For now, we log and continue, but critical services might need to block app start
        logger.error(`Failed to initialize service ${name}`, {}, error as Error)
      }
    })

    await Promise.all(initPromises)

    this.initialized = true
    const duration = Date.now() - startTime
    logger.info(`All services initialized in ${duration}ms`)
  }

  /**
   * Destroy all services (cleanup)
   */
  async destroy(): Promise<void> {
    logger.info("Destroying services...")

    const destroyPromises = Object.entries(this.services).map(async ([name, service]) => {
      if (service.destroy) {
        try {
          await service.destroy()
          logger.debug(`Service ${name} destroyed`)
        } catch (error) {
          logger.error(`Failed to destroy service ${name}`, {}, error as Error)
        }
      }
    })

    await Promise.all(destroyPromises)
    this.services = {}
    this.initialized = false
    logger.info("All services destroyed")
  }
}

// Export singleton instance
export const serviceFactory = new ServiceFactory()

/**
 * Helper to register a service
 */
export function registerService(name: string, service: Service): void {
  serviceFactory.register(name, service)
}

/**
 * Helper to get a service
 */
export function getService<T extends Service>(name: string): T {
  return serviceFactory.get<T>(name)
}
