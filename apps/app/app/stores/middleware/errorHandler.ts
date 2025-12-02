/**
 * Zustand Middleware - Error Handler
 *
 * Catches and handles errors in store actions
 */

import { StateCreator, StoreMutatorIdentifier } from "zustand"

import { errorHandler } from "../../utils/ErrorHandler"

type ErrorHandler = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
) => StateCreator<T, Mps, Mcs>

type ErrorHandlerImpl = <T>(f: StateCreator<T, [], []>) => StateCreator<T, [], []>

const errorHandlerImpl: ErrorHandlerImpl = (f) => (set, get, store) => {
  const errorHandlingSet: typeof set = (...args) => {
    try {
      set(...(args as [any, any]))
    } catch (error) {
      errorHandler.handle(error as Error, {
        context: "zustand_store",
        state: get(),
      })
      // Re-throw to allow component-level handling if needed
      throw error
    }
  }

  store.setState = errorHandlingSet

  return f(errorHandlingSet, get, store)
}

export const errorHandlerMiddleware = errorHandlerImpl as unknown as ErrorHandler
