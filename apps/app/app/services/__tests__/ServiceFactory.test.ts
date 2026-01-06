/**
 * ServiceFactory Tests
 *
 * Comprehensive tests for the service factory pattern implementation
 */

import { errorHandler } from "../../utils/ErrorHandler"
import { logger } from "../../utils/Logger"
import { serviceFactory, registerService, getService, type Service } from "../ServiceFactory"

// Mock logger
jest.mock("../../utils/Logger", () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock error handler
jest.mock("../../utils/ErrorHandler", () => ({
  errorHandler: {
    handle: jest.fn(),
  },
}))

describe("ServiceFactory", () => {
  // Create a fresh factory for each test to avoid state pollution
  let testFactory: typeof serviceFactory

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the factory state by destroying it
    serviceFactory.destroy().catch(() => {
      // Ignore destroy errors in setup
    })
  })

  describe("register", () => {
    it("should register a service", () => {
      const mockService: Service = {
        initialize: jest.fn().mockResolvedValue(undefined),
      }

      registerService("testService", mockService)

      expect(getService("testService")).toBe(mockService)
    })

    it("should warn when overwriting an existing service", () => {
      const service1: Service = {
        initialize: jest.fn().mockResolvedValue(undefined),
      }
      const service2: Service = {
        initialize: jest.fn().mockResolvedValue(undefined),
      }

      registerService("duplicateService", service1)
      registerService("duplicateService", service2)

      expect(logger.warn).toHaveBeenCalledWith(
        "Service duplicateService is already registered. Overwriting.",
      )
      expect(getService("duplicateService")).toBe(service2)
    })
  })

  describe("get", () => {
    it("should return registered service", () => {
      const mockService: Service = {
        initialize: jest.fn().mockResolvedValue(undefined),
      }

      registerService("getTestService", mockService)
      const retrieved = getService("getTestService")

      expect(retrieved).toBe(mockService)
    })

    it("should throw error for unregistered service", () => {
      expect(() => getService("nonExistentService")).toThrow("Service nonExistentService not found")
    })

    it("should return typed service", () => {
      interface CustomService extends Service {
        customMethod: () => string
      }

      const customService: CustomService = {
        initialize: jest.fn().mockResolvedValue(undefined),
        customMethod: () => "custom",
      }

      registerService("typedService", customService)
      const retrieved = getService<CustomService>("typedService")

      expect(retrieved.customMethod()).toBe("custom")
    })
  })

  describe("initialize", () => {
    it("should initialize all registered services", async () => {
      const service1: Service = {
        initialize: jest.fn().mockResolvedValue(undefined),
      }
      const service2: Service = {
        initialize: jest.fn().mockResolvedValue(undefined),
      }

      registerService("initService1", service1)
      registerService("initService2", service2)

      await serviceFactory.initialize()

      expect(service1.initialize).toHaveBeenCalled()
      expect(service2.initialize).toHaveBeenCalled()
    })

    it("should log initialization progress", async () => {
      const mockService: Service = {
        initialize: jest.fn().mockResolvedValue(undefined),
      }

      registerService("logService", mockService)
      await serviceFactory.initialize()

      expect(logger.info).toHaveBeenCalledWith("Initializing services...")
      expect(logger.debug).toHaveBeenCalledWith("Service logService initialized")
    })

    it("should warn if already initialized", async () => {
      const mockService: Service = {
        initialize: jest.fn().mockResolvedValue(undefined),
      }

      registerService("doubleInitService", mockService)
      await serviceFactory.initialize()
      await serviceFactory.initialize()

      expect(logger.warn).toHaveBeenCalledWith("ServiceFactory is already initialized")
    })

    it("should handle service initialization errors gracefully", async () => {
      const error = new Error("Init failed")
      const failingService: Service = {
        initialize: jest.fn().mockRejectedValue(error),
      }
      const successService: Service = {
        initialize: jest.fn().mockResolvedValue(undefined),
      }

      registerService("failingService", failingService)
      registerService("successService", successService)

      await serviceFactory.initialize()

      expect(errorHandler.handle).toHaveBeenCalledWith(error, {
        context: "ServiceFactory.initialize",
        service: "failingService",
      })
      expect(logger.error).toHaveBeenCalled()
      // Other services should still initialize
      expect(successService.initialize).toHaveBeenCalled()
    })

    it("should log total initialization time", async () => {
      const mockService: Service = {
        initialize: jest.fn().mockResolvedValue(undefined),
      }

      registerService("timedService", mockService)
      await serviceFactory.initialize()

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringMatching(/All services initialized in \d+ms/),
      )
    })
  })

  describe("destroy", () => {
    it("should destroy all services with destroy method", async () => {
      const service1: Service = {
        initialize: jest.fn().mockResolvedValue(undefined),
        destroy: jest.fn().mockResolvedValue(undefined),
      }
      const service2: Service = {
        initialize: jest.fn().mockResolvedValue(undefined),
        destroy: jest.fn().mockResolvedValue(undefined),
      }

      registerService("destroyService1", service1)
      registerService("destroyService2", service2)
      await serviceFactory.initialize()
      await serviceFactory.destroy()

      expect(service1.destroy).toHaveBeenCalled()
      expect(service2.destroy).toHaveBeenCalled()
    })

    it("should handle services without destroy method", async () => {
      const serviceWithoutDestroy: Service = {
        initialize: jest.fn().mockResolvedValue(undefined),
      }
      const serviceWithDestroy: Service = {
        initialize: jest.fn().mockResolvedValue(undefined),
        destroy: jest.fn().mockResolvedValue(undefined),
      }

      registerService("noDestroyService", serviceWithoutDestroy)
      registerService("hasDestroyService", serviceWithDestroy)
      await serviceFactory.initialize()
      await serviceFactory.destroy()

      expect(serviceWithDestroy.destroy).toHaveBeenCalled()
      // No error should be thrown for service without destroy
    })

    it("should handle destroy errors gracefully", async () => {
      const error = new Error("Destroy failed")
      const failingService: Service = {
        initialize: jest.fn().mockResolvedValue(undefined),
        destroy: jest.fn().mockRejectedValue(error),
      }

      registerService("failDestroyService", failingService)
      await serviceFactory.initialize()
      await serviceFactory.destroy()

      expect(logger.error).toHaveBeenCalledWith(
        "Failed to destroy service failDestroyService",
        {},
        error,
      )
    })

    it("should log destruction progress", async () => {
      const mockService: Service = {
        initialize: jest.fn().mockResolvedValue(undefined),
        destroy: jest.fn().mockResolvedValue(undefined),
      }

      registerService("logDestroyService", mockService)
      await serviceFactory.initialize()
      await serviceFactory.destroy()

      expect(logger.info).toHaveBeenCalledWith("Destroying services...")
      expect(logger.debug).toHaveBeenCalledWith("Service logDestroyService destroyed")
      expect(logger.info).toHaveBeenCalledWith("All services destroyed")
    })

    it("should allow re-initialization after destroy", async () => {
      const mockService: Service = {
        initialize: jest.fn().mockResolvedValue(undefined),
        destroy: jest.fn().mockResolvedValue(undefined),
      }

      registerService("reinitService", mockService)
      await serviceFactory.initialize()
      await serviceFactory.destroy()

      // Re-register and reinitialize
      registerService("reinitService2", mockService)
      await serviceFactory.initialize()

      expect(mockService.initialize).toHaveBeenCalledTimes(2)
    })
  })

  describe("concurrent operations", () => {
    it("should handle multiple services initializing concurrently", async () => {
      const delays = [100, 50, 150]
      const services = delays.map((delay, index) => ({
        name: `concurrentService${index}`,
        service: {
          initialize: jest
            .fn()
            .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, delay))),
        } as Service,
      }))

      services.forEach(({ name, service }) => registerService(name, service))

      const startTime = Date.now()
      await serviceFactory.initialize()
      const duration = Date.now() - startTime

      // All services should initialize
      services.forEach(({ service }) => {
        expect(service.initialize).toHaveBeenCalled()
      })

      // Should run concurrently (not sequentially)
      // Sequential would be 300ms, concurrent should be ~150ms
      expect(duration).toBeLessThan(250)
    })
  })
})
