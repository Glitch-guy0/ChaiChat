<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Purpose

This document defines the engineering standards that every AI agent must follow when generating, modifying, or reviewing code.

The primary goals are:

- Maintainable code
- Readable architecture
- Strong typing
- Self-documenting APIs
- Long-term scalability
- Predictable patterns across the codebase

---

# Core Principles

## 1. SOLID is Mandatory

Every implementation must follow the SOLID principles.

### Single Responsibility Principle (SRP)

- Every class, function, and module should have exactly one reason to change.
- Avoid large utility files.
- Split logic into focused components.

---

### Open / Closed Principle (OCP)

- Code should be open for extension.
- Closed for modification.

Prefer:

- Strategy Pattern
- Factory Pattern
- Composition
- Dependency Injection

Avoid large switch statements that grow over time.

---

### Liskov Substitution Principle (LSP)

Derived implementations must be interchangeable with their abstractions.

Never introduce behavior that violates expectations of the parent interface.

---

### Interface Segregation Principle (ISP)

Prefer many small interfaces over large "god" interfaces.

Bad:

```ts
interface UserService {
    create()
    update()
    delete()
    login()
    logout()
    uploadAvatar()
    sendEmail()
}
```

Good:

```ts
interface UserRepository {}
interface AuthenticationService {}
interface AvatarService {}
interface EmailService {}
```

---

### Dependency Inversion Principle (DIP)

Depend on abstractions.

Never depend directly on concrete implementations.

Prefer constructor injection.

Example:

```ts
class UserService {
    constructor(
        private readonly repository: UserRepository
    ) {}
}
```

Never instantiate dependencies inside business logic.

Bad:

```ts
const repo = new UserRepository()
```

Good:

```ts
constructor(private readonly repo: IUserRepository)
```

---

# Architecture Rules

## Always create interfaces

Every service must have an interface.

Example:

```ts
export interface IUserService {
    getUser(id: string): Promise<User>;
}
```

Implementation:

```ts
export class UserService implements IUserService {}
```

---

## Always define types

Avoid anonymous object types whenever reused.

Instead of:

```ts
function createUser(data: {
    name: string
    age: number
}) {}
```

Create:

```ts
export interface CreateUserInput {
    name: string
    age: number
}
```

---

## Export shared types

If a shape is reused more than once:

- Extract it
- Export it
- Reuse it

Never duplicate object definitions.

---

## Prefer explicit types

Never rely on implicit object structures across modules.

Every public API should expose named types.

---

# Documentation Rules

## Every exported item must include JSDoc

Required for:

- classes
- interfaces
- enums
- types
- functions
- methods
- hooks
- utilities
- constants (when non-trivial)

---

## Every JSDoc must include

- Description
- Parameters
- Returns
- Throws (if applicable)
- Example

Example:

```ts
/**
 * Creates a new user.
 *
 * @param input User creation payload.
 * @returns Newly created user.
 *
 * @example
 * ```ts
 * const user = await service.createUser({
 *   name: "John",
 *   age: 24,
 * })
 * ```
 */
```

---

## Every interface must have documentation

Example:

```ts
/**
 * Contract for user persistence.
 */
export interface IUserRepository {
    /**
     * Finds a user by ID.
     *
     * @param id User identifier.
     *
     * @returns User if found.
     *
     * @example
     * ```ts
     * const user = await repo.findById("123")
     * ```
     */
    findById(id: string): Promise<User | null>;
}
```

---

# Code Generation Rules

Whenever generating new code:

## Always generate

- interfaces
- types
- enums (when appropriate)
- JSDoc
- examples inside JSDoc
- named exports
- strong typing

Do **not** generate undocumented public APIs.

---

# Function Design

Functions should:

- do one thing
- be small
- have descriptive names
- avoid boolean flag parameters
- avoid side effects
- return early
- be composable

---

# Class Design

Classes should:

- have one responsibility
- receive dependencies via constructor
- never create dependencies internally
- expose minimal public methods
- keep implementation details private

---

# Dependency Injection

Always prefer dependency injection.

Bad:

```ts
class OrderService {
    private payment = new StripePayment();
}
```

Good:

```ts
class OrderService {
    constructor(
        private readonly payment: PaymentProvider
    ) {}
}
```

---

# Error Handling

Never silently swallow errors.

Either:

- handle them
- transform them
- rethrow them

Document thrown errors using JSDoc.

---

# Naming

Use descriptive names.

Good:

- UserRepository
- PaymentProcessor
- OrderFactory
- UserMapper

Avoid:

- Utils
- Helper
- Manager
- Misc
- Common

Unless their responsibility is extremely narrow.

---

# File Organization

Prefer:

```
feature/
    interfaces/
    types/
    services/
    repositories/
    mappers/
    validators/
    errors/
    dto/
```

Avoid dumping everything into one folder.

---

# Composition over Inheritance

Prefer composition whenever possible.

Avoid deep inheritance hierarchies.

---

# Immutability

Prefer immutable data.

Use:

- readonly
- ReadonlyArray
- pure functions

Avoid unnecessary mutation.

---

# Async Rules

Use:

- async/await

Avoid nested promise chains.

Always propagate errors appropriately.

---

# Comments

Do not explain **what** the code does.

Explain **why** something exists when it is not obvious.

JSDoc is mandatory.

Inline comments should be rare.

---

# Testing Considerations

Generated code should be easily testable.

Avoid:

- global state
- hidden dependencies
- singleton abuse

Favor dependency injection and interfaces.

---

# AI Generation Checklist

Before finalizing generated code, verify:

- [ ] SOLID principles followed
- [ ] Interfaces created
- [ ] Named types created
- [ ] Strong typing used
- [ ] JSDoc added
- [ ] Every JSDoc includes an example
- [ ] Public APIs documented
- [ ] Dependency Injection used
- [ ] No duplicated types
- [ ] Functions have a single responsibility
- [ ] Classes have a single responsibility
- [ ] Composition preferred over inheritance
- [ ] Clear naming used
- [ ] Error handling documented
- [ ] No unnecessary comments
- [ ] Code is production-ready

---

# Default Rule

If there is any uncertainty, optimize for:

1. Readability
2. Maintainability
3. Type safety
4. Extensibility
5. Testability

Never sacrifice architecture quality for shorter code.

Assume every generated implementation will be maintained for years by multiple developers.
<!-- END:nextjs-agent-rules -->
