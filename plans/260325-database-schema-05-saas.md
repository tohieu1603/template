# Database Schema: 05-SaaS

> Date: 260325 | Database: **PostgreSQL**

## Use Cases
Multi-tenant SaaS dashboard: org-based tenancy, subscription billing, team management, usage tracking, API keys, feature flags, webhooks.

## Tables (32)

### Core Auth (6) — common
- `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `refresh_tokens`

### Multi-tenant (3)

#### `organizations`
id, name, slug(unique), logo_url, website, industry, size('1-10'/'11-50'/'51-200'/'201+'), timezone(default 'UTC'), owner_id(FK users), is_active, trial_ends_at, created_at, updated_at

#### `organization_members`
id, organization_id(FK), user_id(FK), role('owner'/'admin'/'member'/'viewer'), invited_by(FK users nullable), invited_at, joined_at, is_active, UNIQUE(org_id,user_id), created_at, updated_at

#### `invitations`
id, organization_id(FK), email, role, token(unique), invited_by(FK users), status('pending'/'accepted'/'expired'/'revoked'), expires_at, accepted_at, created_at

### Subscription & Billing (5)

#### `plans`
id, name, slug(unique), description, price_monthly DECIMAL(15,2), price_yearly DECIMAL(15,2), currency(default 'USD'), trial_days(default 0), is_popular, is_active, sort_order, metadata(JSONB), created_at, updated_at

#### `plan_features`
id, plan_id(FK), feature_key('max_projects'/'max_members'/'storage_gb'), feature_name, value, value_type('number'/'boolean'/'string'/'unlimited'), sort_order, created_at

#### `subscriptions`
id, organization_id(FK), plan_id(FK), status('trialing'/'active'/'past_due'/'cancelled'/'expired'), billing_cycle('monthly'/'yearly'), current_period_start, current_period_end, cancel_at_period_end, cancelled_at, trial_start, trial_end, external_id(Stripe sub ID), created_at, updated_at

#### `invoices`
id, organization_id(FK), subscription_id(FK nullable), invoice_number(unique auto-gen), amount, tax_amount, total, currency, status('draft'/'pending'/'paid'/'failed'/'refunded'), billing_name, billing_email, billing_address, paid_at, due_date, external_id, pdf_url, created_at, updated_at

#### `payment_methods`
id, organization_id(FK), type('card'/'bank_transfer'), brand('visa'/'mastercard'), last_four, exp_month, exp_year, is_default, external_id, created_at, updated_at

### Usage & API Keys (2)

#### `usage_records`
id, organization_id(FK), feature_key, quantity BIGINT, period_start, period_end, recorded_at, created_at

#### `api_keys`
id, organization_id(FK), name, key_hash, key_prefix(first 8 chars), scopes(TEXT[]), last_used_at, expires_at, is_active, created_by(FK users), created_at, updated_at

### Feature Flags (2)

#### `features`
id, key(unique), name, description, is_enabled(global toggle), created_at, updated_at

#### `organization_features` (pivot)
organization_id(FK) + feature_id(FK) composite PK, is_enabled, enabled_at

### Domain Resource (1)

#### `projects` (generic org-scoped resource)
id, organization_id(FK), name, slug, description, status('active'/'archived'), created_by(FK users), metadata(JSONB), UNIQUE(org_id,slug), created_at, updated_at

### Webhooks (2)

#### `webhooks`
id, organization_id(FK), url, events(TEXT[]), secret, is_active, last_triggered_at, failure_count, created_at, updated_at

#### `webhook_logs`
id, webhook_id(FK), event, payload(JSONB), response_status, response_body, success, attempted_at

### Common (7) — settings, media, page_contents, contact_submissions, activity_logs, notifications, banners

**Total: 32 tables | ~110 endpoints | 22 modules**
