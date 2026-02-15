# JavaScript/TypeScript Style Guide

## General Principles
- Write code for humans first, machines second
- Maintain consistency throughout the codebase
- Prefer clarity over cleverness
- Follow established patterns and conventions

## TypeScript Specific

### Type Safety
- Use strict TypeScript compiler options (`strict: true`)
- Prefer explicit types over implicit any
- Use discriminated unions for complex conditional types
- Leverage utility types (Partial, Pick, Omit, etc.) when appropriate

### Interfaces vs Types
- Use `interface` for public APIs
- Use `type` for complex object types and union types
- Prefer composition over inheritance

### Async/Await
- Always handle promise rejections
- Use try/catch blocks appropriately
- Prefer async/await over raw promises when possible

## Naming Conventions
- Use camelCase for variables and functions
- Use PascalCase for constructors and classes
- Use UPPER_SNAKE_CASE for constants
- Use descriptive names that clearly express intent
- Avoid abbreviations unless they are widely understood

## Code Organization
- Group related functionality in modules
- Keep functions small and focused on a single responsibility
- Limit function parameters to 3 or fewer
- Use barrel exports (index.ts) to simplify imports

## Error Handling
- Use custom error classes for application-specific errors
- Provide meaningful error messages
- Log errors appropriately but avoid exposing sensitive information
- Fail fast when encountering invalid states

## Testing
- Follow AAA (Arrange, Act, Assert) pattern in tests
- Use descriptive test names that read like sentences
- Test edge cases and error conditions
- Prefer integration tests over unit tests when it makes sense

## Performance
- Avoid unnecessary object creation in loops
- Use memoization for expensive computations
- Be mindful of array/object spread operations in performance-critical code
- Profile code when performance is a concern