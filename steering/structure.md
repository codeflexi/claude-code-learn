# Project Structure

## Architecture

Strict layered architecture with explicit dependency injection wired in `cmd/main.go`.

```
HTTP Request → Middleware → Handler → Actor → {SessionManager, Mapper, EventHandler}
```

## DI Wiring Order (strict — do not reorder)

```
logger → config → database manager → cache → repository → event handler →
serializer → session manager → mapper → actor → handler → routes → server
```

## Directory Layout

```
cmd/main.go                              # Entry point + DI wiring
config/                                  # YAML configs + Go config loader (Viper)
db/
  migrations/                            # SQL migration files (golang-migrate numbered format)
  query/                                 # SQL queries for sqlc code generation
  sqlc.yaml                              # sqlc configuration
  migrations.go                          # Embedded migrations support
internal/
  actor/{domain}/                        # Use-case orchestration
  cache/                                 # Cache interface + in-memory + Redis implementations
  database/                              # Database connections, DBManager interface, SQLClient interface
  event/{domain}/                        # Event publishing (Kafka + mock)
  handler/{domain}/                      # HTTP handlers (Gin)
  handler/handler.go                     # Base Handler struct (embedded by domain handlers)
  mapper/{domain}/                       # Domain ↔ DTO transformations
  models/{domain}/                       # Request/response domain models
  repository/{domain}/                   # Data access (in-memory + Postgres implementations)
  routes/                                # Route registration (one file per domain)
  server/                                # HTTP server factory
  sessionmanager/{domain}/               # Session state management via Cache
pkg/
  serializer/                            # Serializer interface + JSON + Protobuf + .proto
mockservice/                             # Mock service registry for local/test
local_data/                              # Mock response fixtures (JSON)
document/                                # Architecture docs
```

## Current Domains

| Domain | Layers present |
|--------|---------------|
| `emailsend` | actor, event, handler, mapper, models, repository, routes, sessionmanager |
| `emailtemplate` | repository (in-memory + Postgres, sqlc-generated) |
| `health` | handler, models, routes |

## Conventions

- Each domain feature (e.g., `emailsend`) gets a sub-package under every layer directory. New domains follow the same pattern: `internal/actor/newdomain/`, `internal/handler/newdomain/`, etc.
- All domain sub-packages use the same Go package name as the domain (e.g., `package emailsend`). Use import aliases when importing multiple domain packages together (see `cmd/main.go`).
- Routes are registered via `Register{Domain}Routes` functions in `internal/routes/`.
- Interfaces are defined in the package that uses them (e.g., `Cache` in `internal/cache/`, `Serializer` in `pkg/serializer/`, `DBManager` in `internal/database/`).
- The Cache interface operates on raw `[]byte` only — serialization is always the caller's responsibility.
- Repository packages provide both in-memory and Postgres implementations behind a shared interface. The wiring in `cmd/main.go` selects the implementation based on `database.mode` config.
- `internal/database/client.go` defines `SQLClient` interface satisfied by both `*sql.DB` and `*sql.Tx` for testability.
- Handler error path: call `c.Error(err)` then `return`. Never write the HTTP response directly on error.
- Errors use descriptive string codes: `fmt.Errorf("err_session_read_failed: %w", err)`.
- Property-based tests use `github.com/leanovate/gopter` with minimum 100 iterations. Tag each with `// Feature: email-service, Property N: <name>`.
- Test files use `_test.go` suffix in the same package.
