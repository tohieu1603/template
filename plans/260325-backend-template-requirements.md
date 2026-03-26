# Backend Template Requirements Specification

> For AI agents to read and build production-ready BE APIs following this exact architecture.
> Reference implementation: `/01-ecommerce/` (tested, 50/50 pass)

---

## 1. TECH STACK (NON-NEGOTIABLE)

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 18+ |
| Language | TypeScript | strict mode |
| Framework | Express.js | 4.x |
| ORM | TypeORM | 0.3.x |
| Database | PostgreSQL | 14+ |
| Auth | JWT (jsonwebtoken) | access + refresh tokens |
| Validation | class-validator + class-transformer | DTO pattern |
| Docs | swagger-jsdoc + swagger-ui-express | auto-generated |
| Logger | winston | file + console |
| Security | helmet, cors, compression, express-rate-limit | |
| Password | bcrypt | 12 rounds |
| File upload | multer | disk storage |

### Dependencies (package.json)
```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.3.1",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "pg": "^8.12.0",
    "reflect-metadata": "^0.2.2",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.1",
    "typeorm": "^0.3.20",
    "uuid": "^10.0.0",
    "winston": "^3.13.0"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/compression": "^1.7.5",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.14.0",
    "@types/swagger-jsdoc": "^6.0.4",
    "@types/swagger-ui-express": "^4.1.6",
    "@types/uuid": "^10.0.0",
    "nodemon": "^3.1.3",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5"
  }
}
```

---

## 2. PROJECT STRUCTURE (MUST FOLLOW EXACTLY)

```
project-name/
├── src/
│   ├── config/
│   │   ├── env.config.ts           # dotenv + validation
│   │   ├── database.config.ts      # TypeORM DataSource
│   │   ├── jwt.config.ts           # JWT secrets + expiry
│   │   └── swagger.config.ts       # Swagger spec generation
│   ├── common/
│   │   ├── entities/
│   │   │   └── base.entity.ts      # UUID PK + timestamptz
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts   # PaginationQueryDto + meta builder
│   │   │   └── api-response.dto.ts # successResponse() / errorResponse()
│   │   ├── errors/
│   │   │   └── app-error.ts        # AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts           # JWT verify, attach req.user
│   │   │   ├── rbac.middleware.ts           # Permission check via DB
│   │   │   ├── validate.middleware.ts       # class-validator DTO validation
│   │   │   ├── error-handler.middleware.ts  # Global error catch
│   │   │   └── request-logger.middleware.ts # Winston request log
│   │   └── utils/
│   │       ├── logger.ts           # Winston logger instance
│   │       ├── password.util.ts    # hashPassword(), comparePassword()
│   │       ├── slug.util.ts        # generateSlug()
│   │       └── token.util.ts       # signAccessToken(), signRefreshToken(), verify, hash
│   ├── modules/
│   │   └── [module-name]/          # One folder per domain
│   │       ├── entities/           # TypeORM entities
│   │       │   └── [name].entity.ts
│   │       ├── dto/                # Request validation DTOs
│   │       │   └── [name].dto.ts
│   │       ├── [name].service.ts   # Business logic
│   │       ├── [name].controller.ts # HTTP handlers (req → service → res)
│   │       └── [name].routes.ts    # Express Router
│   ├── database/
│   │   └── seeds/
│   │       └── index.ts            # Idempotent seed script
│   ├── app.ts                      # Express app factory
│   └── server.ts                   # Entry point
├── .env.example
├── .gitignore
├── tsconfig.json
├── nodemon.json
└── package.json
```

---

## 3. BASE CLASSES (COPY EXACTLY)

### 3.1 BaseEntity
```typescript
import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity as TypeOrmBaseEntity } from 'typeorm';

export abstract class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
```

### 3.2 PaginationQueryDto
```typescript
export class PaginationQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number = 10;

  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @IsString()
  sortBy?: string;

  @IsOptional() @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
```

### 3.3 API Response Format (ALL endpoints MUST use)
```typescript
// Success
{ "success": true, "data": {...}, "message": "...", "meta": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 } }

// Error
{ "success": false, "message": "Error description", "errors": [...] }
```

### 3.4 Error Classes
```
AppError (base)
├── ValidationError     (400)
├── UnauthorizedError   (401)
├── ForbiddenError      (403)
├── NotFoundError       (404)
├── ConflictError       (409)
└── UnprocessableError  (422)
```

---

## 4. AUTH SYSTEM (CRITICAL — Follow exactly)

### 4.1 JWT Token Pair
- **Access token**: short-lived (15m), contains `{ sub: userId, email, roles: string[] }`
- **Refresh token**: long-lived (7d), contains `{ sub: userId, familyId }`
- Both signed with DIFFERENT secrets

### 4.2 Token Family Revocation
- On **login**: create new `family_id` (UUID), store hashed refresh token in `refresh_tokens` table
- On **refresh**: verify token → check family not revoked → issue new pair with SAME family_id → revoke old token
- On **token reuse** (already-revoked token used): **revoke ALL tokens in that family** (security breach detected)
- On **logout**: revoke specific refresh token

### 4.3 refresh_tokens Table
```
id           UUID PK
user_id      UUID FK → users
token_hash   VARCHAR(255)    -- bcrypt or sha256 hash
family_id    UUID            -- group tokens for bulk revocation
is_revoked   BOOLEAN default false
expires_at   TIMESTAMPTZ
ip_address   VARCHAR(45)     nullable
user_agent   TEXT            nullable
created_at   TIMESTAMPTZ
```

### 4.4 Auth Endpoints
```
POST /auth/register   -- create user + assign default role
POST /auth/login      -- verify credentials + issue token pair
POST /auth/refresh    -- rotate tokens (family revocation)
POST /auth/logout     -- revoke refresh token
GET  /auth/me         -- get current user profile (AUTH required)
```

---

## 5. RBAC SYSTEM (CRITICAL — DB-backed, dynamic)

### 5.1 Tables
```
roles              -- id, name (unique), display_name, description, is_default
permissions        -- id, name (unique, e.g. 'products.create'), display_name, group_name
role_permissions   -- role_id + permission_id (composite PK, ManyToMany JoinTable on Role entity)
user_roles         -- user_id + role_id (composite PK, ManyToMany JoinTable on User entity)
```

### 5.2 RBAC Middleware Usage
```typescript
// Public endpoint (no auth)
router.get('/', listItems);

// Auth required but no specific permission
router.get('/me', auth(), getMe);

// Auth + specific permission required
router.post('/', auth(), rbac('products.create'), validateDto(CreateProductDto), createProduct);
```

### 5.3 RBAC Middleware Logic
```typescript
export function rbac(permission: string) {
  return async (req, res, next) => {
    if (!req.user) throw UnauthorizedError;
    if (req.user.roles.includes('super_admin')) return next(); // bypass
    const has = await checkUserPermission(req.user.id, permission); // DB query
    if (!has) throw ForbiddenError(`Permission '${permission}' required`);
    next();
  };
}
```

### 5.4 Permission Naming Convention
Format: `{module}.{action}` — e.g. `products.create`, `orders.update`, `settings.delete`
Actions: `view`, `create`, `update`, `delete`

### 5.5 Default Seed Roles
| Role | Permissions |
|------|------------|
| super_admin | ALL (bypassed in middleware) |
| admin | All except *.delete |
| staff | *.view only |
| customer/reader | Default role, no admin permissions |

---

## 6. ENTITY RULES

### 6.1 All FK Columns MUST have `type: 'uuid'`
```typescript
// CORRECT
@Column({ name: 'user_id', type: 'uuid' })
userId: string;

// WRONG — causes "operator does not exist: uuid = character varying"
@Column({ name: 'user_id' })
userId: string;
```

### 6.2 All Timestamps MUST use `timestamptz`
```typescript
@CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
@Column({ type: 'timestamptz', nullable: true })
```

### 6.3 Pivot Tables
Use `@ManyToMany` + `@JoinTable` on ONE side for TypeORM to auto-create pivot tables:
```typescript
// In Role entity
@ManyToMany(() => Permission, { eager: false })
@JoinTable({
  name: 'role_permissions',
  joinColumn: { name: 'role_id', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
})
permissions: Permission[];
```

For non-ORM pivots (raw SQL inserts), create standalone entity with composite PK:
```typescript
@Entity('product_variant_attributes')
export class ProductVariantAttribute {
  @PrimaryColumn({ name: 'variant_id', type: 'uuid' })
  variantId: string;
  @PrimaryColumn({ name: 'attribute_value_id', type: 'uuid' })
  attributeValueId: string;
}
```

---

## 7. MODULE PATTERN (Follow for every module)

### 7.1 Entity → DTO → Service → Controller → Routes

**Entity** — TypeORM entity mapping to DB table
**DTO** — class-validator decorated classes for input validation
**Service** — business logic, calls repository/raw SQL, throws AppError
**Controller** — thin layer: parse req → call service → send response
**Routes** — Express Router with middleware chain

### 7.2 Controller Pattern
```typescript
export const listItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.findAll(req.query);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) {
    next(error);
  }
};
```

### 7.3 Service Pattern
```typescript
async findAll(query: ItemQueryDto) {
  const { page = 1, limit = 10, search, status } = query;
  const offset = (page - 1) * limit;

  const qb = this.repo.createQueryBuilder('t')
    .orderBy('t.createdAt', 'DESC')
    .limit(limit).offset(offset);

  if (search) qb.where('t.name ILIKE :s', { s: `%${search}%` });
  if (status) qb.andWhere('t.status = :status', { status });

  const [items, total] = await qb.getManyAndCount();
  return { items, meta: buildPaginationMeta(page, limit, total) };
}
```

### 7.4 Route Pattern
```typescript
const router = Router();

// Public
router.get('/', validateDto(QueryDto, 'query'), listItems);
router.get('/:id', getItem);

// Admin
router.post('/', auth(), rbac('items.create'), validateDto(CreateDto), createItem);
router.put('/:id', auth(), rbac('items.update'), validateDto(UpdateDto), updateItem);
router.delete('/:id', auth(), rbac('items.delete'), deleteItem);

export default router;
```

---

## 8. COMMON MODULES (Always include in ALL templates)

These modules are **required in every template**, regardless of domain:

| Module | Tables | Purpose |
|--------|--------|---------|
| auth | refresh_tokens | Register, login, refresh, logout, me |
| user | users | CRUD users (admin) |
| role | roles, permissions, role_permissions, user_roles | RBAC management |
| setting | settings | Key-value site config |
| media | media | File upload library |
| page-content | page_contents | Static pages (about, terms, privacy) |
| contact | contact_submissions | Contact form |
| activity-log | activity_logs | Admin action tracking |
| notification | notifications | User notifications |
| banner | banners | Promotional banners |

---

## 9. PAGINATION, SEARCH, FILTER

### 9.1 All list endpoints MUST support:
- `?page=1&limit=10` — pagination (default 10/page)
- `?search=keyword` — ILIKE search on relevant text columns
- `?sortBy=createdAt&sortOrder=DESC` — sorting
- Domain-specific filters: `?status=active&categoryId=uuid`

### 9.2 Response always includes meta:
```json
{ "meta": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 } }
```

---

## 10. SWAGGER (Detailed)

- Every endpoint MUST have JSDoc annotations
- Group by tags matching module names
- Include request body schemas, response schemas, auth requirements
- Available at `{API_PREFIX}/docs`

---

## 11. SEED SCRIPT

File: `src/database/seeds/index.ts`
Must be **idempotent** (safe to run multiple times via `ON CONFLICT DO NOTHING`).

Seeds:
1. Default roles (super_admin, admin, staff, + domain default)
2. All permissions (module.action pattern, 4 actions per module)
3. Role-permission assignments
4. Admin user (from env: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD)
5. User-role assignment (admin → super_admin)
6. Default settings
7. Domain-specific seed data

---

## 12. ENV CONFIG

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=project_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false
DB_SYNC=true          # Auto-create tables (dev only)
DB_LOGGING=false

# JWT
JWT_ACCESS_SECRET=random_secret_at_least_32_chars
JWT_REFRESH_SECRET=different_random_secret_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# Logging
LOG_LEVEL=info
LOG_DIR=logs

# Admin Seed
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=Admin@123
```

---

## 13. NAMING CONVENTIONS

| What | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `product-variant.entity.ts` |
| Folders | kebab-case | `shipping-method/` |
| Classes | PascalCase | `ProductVariant` |
| Variables | camelCase | `stockQuantity` |
| DB tables | snake_case | `product_variants` |
| DB columns | snake_case | `created_at` |
| Entity props | camelCase + @Column name | `@Column({ name: 'stock_quantity' }) stockQuantity` |
| Routes | kebab-case plural | `/api/v1/shipping-methods` |
| Permissions | dot notation | `products.create` |
| ENUMs | Use VARCHAR + comment allowed values (no PG ENUM for flexibility) or TypeORM enum |

---

## 14. CRITICAL GOTCHAS (Learned from 01-ecommerce)

1. **FK columns MUST have `type: 'uuid'`** — otherwise TypeORM creates `varchar` causing operator mismatch
2. **Pivot tables need entity OR @JoinTable** — TypeORM won't create tables from raw SQL in service
3. **Seed script: no `assigned_at` in JoinTable pivots** — TypeORM JoinTable only creates FK columns
4. **Coupon value=0 for free_shipping** — use `@Min(0)` not `@IsPositive()` on value field
5. **Cart update/delete: support lookup by item ID OR variant ID** — better UX for frontend
6. **`DB_SYNC=true` only in dev** — use migrations in production
7. **Register must auto-assign default role** — query `WHERE is_default = true`

---

## 15. QUALITY CHECKLIST (Before marking complete)

- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run seed` — runs without errors
- [ ] `npm run dev` — server starts, tables created
- [ ] All CRUD endpoints work (create, read, update, delete)
- [ ] Pagination works with meta
- [ ] Search/filter works on list endpoints
- [ ] JWT login returns access + refresh tokens
- [ ] Token refresh rotates tokens correctly
- [ ] RBAC: admin can access admin routes
- [ ] RBAC: customer gets 403 on admin routes
- [ ] RBAC: no token gets 401
- [ ] Swagger loads at /api/v1/docs
- [ ] Seed creates roles, permissions, admin user

---

## 16. HOW TO BUILD A NEW TEMPLATE

1. Read this requirements doc
2. Read the DB schema from `plans/260325-database-schemas-*.md`
3. Create project structure following Section 2
4. Copy common modules from Section 8 (auth, user, role, setting, media, etc.)
5. Add domain-specific modules (e.g. blog: posts, authors, tags, series, comments)
6. Create entities matching DB schema (follow Section 6 rules)
7. Create DTOs with class-validator (follow Section 7)
8. Create services with QueryBuilder (follow Section 7.3)
9. Create controllers (follow Section 7.2)
10. Create routes with middleware chain (follow Section 7.4)
11. Register all routes in app.ts
12. Write seed script (follow Section 11)
13. Create .env.example
14. Run quality checklist (Section 15)

---

## REFERENCE PROJECTS

| # | Template | Dir | DB Schema | Status |
|---|----------|-----|-----------|--------|
| 01 | E-commerce | `/01-ecommerce/` | 31 tables, 135 files | DONE, tested |
| 02 | Blog | `/02-blog/` | 27 tables | Pending |
| 03 | Portfolio | `/03-portfolio/` | TBD | Pending |
| 04 | Landing Page | `/04-landing-page/` | TBD | Pending |
| 05 | SaaS | `/05-saas/` | TBD | Pending |
| 06 | Booking | `/06-booking/` | TBD | Pending |
| 07 | Restaurant | `/07-restaurant/` | TBD | Pending |
| 08 | Real Estate | `/08-real-estate/` | TBD | Pending |
| 09 | Clinic | `/09-clinic/` | TBD | Pending |
| 10 | Education | `/10-education/` | TBD | Pending |
