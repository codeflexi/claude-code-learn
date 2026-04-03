# Tech Stack

## Language & Runtime

- Go 1.25
- Module: `email-service`

## Frameworks & Libraries

| Library | Purpose |
|---------|---------|
| `github.com/gin-gonic/gin` | HTTP router and middleware |
| `github.com/spf13/viper` | Configuration loading (YAML + env vars) |
| `go.uber.org/zap` | Structured logging |
| `github.com/redis/go-redis/v9` | Redis client |
| `github.com/segmentio/kafka-go` | Kafka producer |
| `github.com/jackc/pgx/v5` | PostgreSQL driver (via `database/sql`) |
| `github.com/golang-migrate/migrate/v4` | Database schema migrations |
| `github.com/google/uuid` | UUID generation |
| `google.golang.org/protobuf` | Protobuf serialization |
| `github.com/stretchr/testify` | Test assertions |
| `github.com/leanovate/gopter` | Property-based testing |

## Build & CI

- Build system: `make` (see Makefile)
- Linter: `golangci-lint` (config in `.golangci.yml`, enable-all with select disables)
- CI: GitLab CI (`.gitlab-ci.yml`) — stages: pre-build → build → test → build-docker → notify
- Docker: Multi-stage Alpine build (`golang:1.25-alpine` → `alpine:latest`), runs as non-root `appuser`, exposes port 8080, includes HEALTHCHECK
- Container registry: AWS ECR
- SQL code generation: `sqlc` (config in `db/sqlc.yaml`)

## Common Commands

```bash
make setup          # Copy config.example.yaml → config.yaml (first-time)
make run            # go run ./cmd/main.go
make build          # go build → bin/email-service
make test           # go test -v -race ./...
make test-pbt       # go test -v -race -run "Property" ./...
make test-coverage  # Generates coverage.out + coverage.html
make lint           # golangci-lint run ./...
make fmt            # go fmt ./...
make vet            # go vet ./...
make tidy           # go mod tidy && go mod verify
make proto-gen      # protoc → pkg/serializer/email.pb.go
make migrate-up     # Run all pending database migrations (requires $DATABASE_URL)
make migrate-down   # Roll back the most recent migration (requires $DATABASE_URL)
make sqlc-gen       # Generate type-safe Go code from SQL queries (db/sqlc.yaml)
make docker-build   # docker build -t email-service:latest .
make compose-up     # docker compose up -d
make compose-down   # docker compose down
make compose-logs   # docker compose logs -f
make clean          # Remove bin/, coverage artifacts
```

## Configuration

Config loaded from `CONFIG_FILE` env var, defaulting to `config/config.yaml`. Uses Viper with YAML files and automatic env var override.

Key config switches:

| Key | Values | Effect |
|-----|--------|--------|
| `database.mode` | `in_memory` / `postgres` | Swap repository backend |
| `cache_database.mode` | `in_memory` / `redis` | Swap cache backend |
| `kafka.serializer.type` | `json` / `protobuf` | Swap serializer for cache + Kafka |

## Database

- Migrations live in `db/migrations/` using `golang-migrate` numbered format (`000001_*.up.sql` / `000001_*.down.sql`)
- Auto-run on startup when `database.mode=postgres` (via `DBManager.RunMigrations`)
- SQL queries in `db/query/` → sqlc generates type-safe Go into `internal/repository/emailtemplate/`
