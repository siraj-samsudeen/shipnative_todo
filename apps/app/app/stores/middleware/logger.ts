/**
 * Zustand Middleware - Logger
 *
 * Logs state changes in development for debugging
 */

import { StateCreator, StoreMutatorIdentifier } from "zustand"

import { logger } from "../../utils/Logger"

type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string,
) => StateCreator<T, Mps, Mcs>

type LoggerImpl = <T>(f: StateCreator<T, [], []>, name?: string) => StateCreator<T, [], []>

const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
  const loggedSet: typeof set = (...args) => {
    const prevState = get()
    set(...(args as [any, any]))
    const nextState = get()

    if (__DEV__) {
      logger.debug(`Store ${name || "unknown"} updated`, {
        prevState,
        nextState,
        action: args[0],
      })
    }
  }

  store.setState = loggedSet

  return f(loggedSet, get, store)
}

export const loggerMiddleware = loggerImpl as unknown as Logger
