# ADR 002: Service Layer Pattern

## Status
Accepted

## Context
Services were previously initialized in `App.tsx` or imported directly, leading to tight coupling and difficult testing. There was no standard way to manage service lifecycle or dependencies.

## Decision
We implemented a `ServiceFactory` pattern that:
1. Acts as a central registry for all services
2. Manages initialization and destruction lifecycles
3. Provides a single point of access for services
4. Allows for easier mocking in tests

## Consequences
### Positive
- Decoupled service initialization from UI
- Consistent lifecycle management
- Easier to mock services for testing
- Centralized logging of service status

### Negative
- Slight increase in boilerplate code for new services
- Need to register services explicitly
