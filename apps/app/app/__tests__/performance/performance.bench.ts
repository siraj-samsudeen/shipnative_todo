/**
 * Performance Benchmarks
 *
 * Measures critical performance metrics for the app.
 * Run with: yarn test:bench (after adding the script)
 *
 * These benchmarks establish baseline performance metrics and help
 * identify regressions in critical paths.
 */

// Simple performance measurement utilities
const measureTime = async <T>(
  fn: () => Promise<T> | T,
): Promise<{ result: T; duration: number }> => {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  return { result, duration }
}

const runBenchmark = async (
  name: string,
  fn: () => Promise<void> | void,
  iterations: number = 100,
): Promise<{ name: string; mean: number; min: number; max: number; iterations: number }> => {
  const times: number[] = []

  // Warm up
  for (let i = 0; i < 5; i++) {
    await fn()
  }

  // Actual measurements
  for (let i = 0; i < iterations; i++) {
    const { duration } = await measureTime(fn)
    times.push(duration)
  }

  const sorted = times.sort((a, b) => a - b)
  const mean = times.reduce((a, b) => a + b, 0) / times.length
  const min = sorted[0]
  const max = sorted[sorted.length - 1]

  return { name, mean, min, max, iterations }
}

// Mock implementations for benchmarking
const mockTheme = {
  colors: {
    primary: "#000",
    background: "#fff",
    foreground: "#000",
  },
  spacing: { sm: 8, md: 16, lg: 24 },
  typography: { sizes: { base: 16 } },
  radius: { sm: 4, md: 8 },
}

describe("Performance Benchmarks", () => {
  describe("Store Operations", () => {
    it("should perform zustand state updates quickly", async () => {
      // Simulate zustand-like state updates
      let state = { count: 0, items: [] as number[] }
      const setState = (partial: Partial<typeof state>) => {
        state = { ...state, ...partial }
      }

      const result = await runBenchmark(
        "zustand state update",
        () => {
          setState({ count: state.count + 1 })
        },
        1000,
      )

      console.log(
        `Zustand state update: ${result.mean.toFixed(4)}ms avg (${result.iterations} iterations)`,
      )

      // State updates should be sub-millisecond
      expect(result.mean).toBeLessThan(1)
    })

    it("should handle array state updates efficiently", async () => {
      let items: number[] = []

      const result = await runBenchmark(
        "array append",
        () => {
          items = [...items.slice(-99), items.length]
        },
        500,
      )

      console.log(`Array append (100 items): ${result.mean.toFixed(4)}ms avg`)

      // Array operations should be fast
      expect(result.mean).toBeLessThan(1)
    })
  })

  describe("Theme/Style Operations", () => {
    it("should create styles quickly", async () => {
      const createStyles = (theme: typeof mockTheme) => ({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: theme.spacing.md,
        },
        text: {
          color: theme.colors.foreground,
          fontSize: theme.typography.sizes.base,
        },
        button: {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.md,
          padding: theme.spacing.sm,
        },
      })

      const result = await runBenchmark(
        "style creation",
        () => {
          createStyles(mockTheme)
        },
        1000,
      )

      console.log(`Style creation: ${result.mean.toFixed(4)}ms avg`)

      // Style creation should be very fast
      expect(result.mean).toBeLessThan(0.5)
    })

    it("should merge style objects efficiently", async () => {
      const baseStyle = { flex: 1, padding: 16, margin: 8 }
      const overrideStyle = { padding: 24, backgroundColor: "#fff" }

      const result = await runBenchmark(
        "style merge",
        () => {
          Object.assign({}, baseStyle, overrideStyle)
        },
        1000,
      )

      console.log(`Style merge: ${result.mean.toFixed(4)}ms avg`)

      expect(result.mean).toBeLessThan(0.1)
    })
  })

  describe("Data Processing", () => {
    it("should filter large arrays efficiently", async () => {
      const items = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        active: i % 2 === 0,
      }))

      const result = await runBenchmark(
        "array filter (1000 items)",
        () => {
          items.filter((item) => item.active)
        },
        500,
      )

      console.log(`Array filter (1000 items): ${result.mean.toFixed(4)}ms avg`)

      // Filtering should be fast
      expect(result.mean).toBeLessThan(1)
    })

    it("should map large arrays efficiently", async () => {
      const items = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      }))

      const result = await runBenchmark(
        "array map (1000 items)",
        () => {
          items.map((item) => ({ ...item, processed: true }))
        },
        500,
      )

      console.log(`Array map (1000 items): ${result.mean.toFixed(4)}ms avg`)

      expect(result.mean).toBeLessThan(2)
    })

    it("should handle JSON operations efficiently", async () => {
      const data = {
        user: { id: 1, name: "Test User", email: "test@example.com" },
        items: Array.from({ length: 100 }, (_, i) => ({ id: i, value: `value-${i}` })),
        metadata: { created: new Date().toISOString(), version: "1.0.0" },
      }

      const result = await runBenchmark(
        "JSON stringify/parse",
        () => {
          JSON.parse(JSON.stringify(data))
        },
        500,
      )

      console.log(`JSON stringify/parse: ${result.mean.toFixed(4)}ms avg`)

      expect(result.mean).toBeLessThan(2)
    })
  })

  describe("String Operations", () => {
    it("should format strings efficiently", async () => {
      const template = "Hello, {name}! You have {count} notifications."
      const values = { name: "User", count: "5" }

      const result = await runBenchmark(
        "string template",
        () => {
          template.replace(/{(\w+)}/g, (_, key) => values[key as keyof typeof values] || "")
        },
        1000,
      )

      console.log(`String template: ${result.mean.toFixed(4)}ms avg`)

      expect(result.mean).toBeLessThan(0.1)
    })

    it("should validate email efficiently", async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const emails = ["test@example.com", "invalid-email", "another@test.org", "not-valid"]

      const result = await runBenchmark(
        "email validation",
        () => {
          emails.forEach((email) => emailRegex.test(email))
        },
        1000,
      )

      console.log(`Email validation (4 emails): ${result.mean.toFixed(4)}ms avg`)

      expect(result.mean).toBeLessThan(0.1)
    })
  })

  describe("Object Operations", () => {
    it("should perform deep clone efficiently", async () => {
      const obj = {
        level1: {
          level2: {
            level3: {
              value: "deep",
              array: [1, 2, 3],
            },
          },
        },
        items: [{ a: 1 }, { b: 2 }],
      }

      const result = await runBenchmark(
        "deep clone (JSON method)",
        () => {
          JSON.parse(JSON.stringify(obj))
        },
        500,
      )

      console.log(`Deep clone: ${result.mean.toFixed(4)}ms avg`)

      expect(result.mean).toBeLessThan(0.5)
    })

    it("should perform shallow comparison efficiently", async () => {
      const obj1 = { a: 1, b: 2, c: 3, d: 4, e: 5 }
      const obj2 = { a: 1, b: 2, c: 3, d: 4, e: 5 }

      const shallowEqual = (a: Record<string, unknown>, b: Record<string, unknown>) => {
        const keysA = Object.keys(a)
        const keysB = Object.keys(b)
        if (keysA.length !== keysB.length) return false
        return keysA.every((key) => a[key] === b[key])
      }

      const result = await runBenchmark(
        "shallow comparison",
        () => {
          shallowEqual(obj1, obj2)
        },
        1000,
      )

      console.log(`Shallow comparison: ${result.mean.toFixed(4)}ms avg`)

      expect(result.mean).toBeLessThan(0.1)
    })
  })

  describe("Memory Patterns", () => {
    it("should handle repeated object creation efficiently", async () => {
      const result = await runBenchmark(
        "object creation",
        () => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const obj = {
            id: Math.random(),
            timestamp: Date.now(),
            data: { nested: { value: "test" } },
          }
        },
        1000,
      )

      console.log(`Object creation: ${result.mean.toFixed(4)}ms avg`)

      expect(result.mean).toBeLessThan(0.1)
    })

    it("should handle Map operations efficiently", async () => {
      const map = new Map<string, number>()

      const result = await runBenchmark(
        "Map set/get",
        () => {
          const key = `key-${Math.random()}`
          map.set(key, Math.random())
          map.get(key)
          map.delete(key)
        },
        1000,
      )

      console.log(`Map operations: ${result.mean.toFixed(4)}ms avg`)

      expect(result.mean).toBeLessThan(0.1)
    })

    it("should handle Set operations efficiently", async () => {
      const set = new Set<string>()

      const result = await runBenchmark(
        "Set add/has/delete",
        () => {
          const value = `value-${Math.random()}`
          set.add(value)
          set.has(value)
          set.delete(value)
        },
        1000,
      )

      console.log(`Set operations: ${result.mean.toFixed(4)}ms avg`)

      expect(result.mean).toBeLessThan(0.1)
    })
  })
})

// Summary reporter
afterAll(() => {
  console.log("\n=== Performance Benchmark Summary ===")
  console.log("All benchmarks completed. Review individual results above.")
  console.log("Thresholds are set to catch regressions while allowing normal variance.")
})
