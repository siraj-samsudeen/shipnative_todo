# ADR 003: State Management Approach

## Status
Accepted

## Context
The app uses Zustand for global state. As the app grows, we needed patterns to ensure state management remains maintainable, debuggable, and performant.

## Decision
We enhanced the Zustand implementation with:
1. **Middleware**: Added logging and error handling middleware
2. **Selectors**: Enforced use of memoized selectors for derived state
3. **Composition**: Split stores by domain (Auth, Subscription)
4. **Persistence**: Configured MMKV for fast persistence

## Consequences
### Positive
- Better debugging with state change logging
- Improved performance with selectors
- Consistent error handling in stores
- Type-safe state management

### Negative
- More boilerplate for selectors
- Learning curve for middleware pattern
