# ADR 001: Centralized Error Handling

## Status
Accepted

## Context
The application lacked a consistent strategy for handling errors. Errors were often caught locally in components or ignored, leading to inconsistent user experience and difficult debugging. We needed a way to classify errors, provide user-friendly messages, and report critical issues.

## Decision
We implemented a centralized `ErrorHandler` class that:
1. Classifies errors into categories (Network, Auth, Validation, etc.)
2. Determines severity levels (Low, Medium, High, Critical)
3. Provides user-friendly error messages
4. Handles reporting to crash reporting services (Sentry)
5. Implements retry logic for transient failures

## Consequences
### Positive
- Consistent error messages across the app
- Better debugging with categorized errors
- Automatic retry for network issues improves resilience
- Critical errors are reliably reported

### Negative
- Developers must remember to use `errorHandler.handle()` instead of just `console.error`
- Slight overhead in processing errors
