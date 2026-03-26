# Database Schema: 06-Booking

> Date: 260326 | Database: **PostgreSQL**

## Use Cases
Booking system: khach san, nha khoa, salon, phong kham, co-working. Support:
- Service categories + services with duration/pricing
- Staff/provider profiles with working hours
- Time slot availability + booking flow
- Customer management
- Payment tracking
- Reviews after service

## Tables (30)

### Core Auth (6) — common
- `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `refresh_tokens`

### Providers/Staff (3)

#### `providers`
id, user_id(FK nullable), name, slug(unique), title, bio, short_bio, avatar_url, phone, email, specializations(TEXT[]), is_active, sort_order, meta_title, meta_description, created_at, updated_at

#### `working_hours`
id, provider_id(FK), day_of_week(0-6, 0=Sunday), start_time(TIME), end_time(TIME), is_available(default true), created_at

#### `provider_breaks`
id, provider_id(FK), day_of_week(0-6), start_time(TIME), end_time(TIME), reason(nullable), created_at

### Services (2)

#### `service_categories`
id, name, slug(unique), description, image_url, sort_order, is_active, created_at, updated_at

#### `services`
id, category_id(FK), name, slug(unique), description, short_description, image_url, duration_minutes(INT), buffer_minutes(INT default 0, gap giua 2 booking), price DECIMAL(15,2), compare_at_price(nullable), currency(default 'VND'), max_capacity(INT default 1, group booking), requires_deposit(BOOLEAN default false), deposit_amount DECIMAL(15,2 nullable), is_active, is_featured, sort_order, meta_title, meta_description, created_at, updated_at

### Booking (5)

#### `provider_services` (pivot — provider nao lam service nao)
provider_id(FK) + service_id(FK) composite PK

#### `bookings`
id, customer_id(FK users), provider_id(FK), service_id(FK), booking_number(unique auto-gen BK-260326-0001), status('pending'/'confirmed'/'in_progress'/'completed'/'cancelled'/'no_show'), booking_date(DATE), start_time(TIME), end_time(TIME), duration_minutes(INT), price DECIMAL(15,2), deposit_amount DECIMAL(15,2 default 0), note(nullable customer note), admin_note(nullable), cancellation_reason(nullable), cancelled_at(nullable), confirmed_at(nullable), completed_at(nullable), created_at, updated_at

#### `booking_status_history`
id, booking_id(FK), from_status, to_status, note, changed_by(FK users nullable), created_at

#### `blocked_slots` (ngay nghi, slot bi khoa)
id, provider_id(FK), blocked_date(DATE), start_time(TIME nullable — null = ca ngay), end_time(TIME nullable), reason, created_by(FK users), created_at

#### `time_slots` (optional — pre-generated hoac virtual)
id, provider_id(FK), service_id(FK), slot_date(DATE), start_time(TIME), end_time(TIME), is_available(default true), booking_id(FK nullable — da dat), created_at

### Customers (1)

#### `customer_profiles`
id, user_id(FK unique), phone, date_of_birth(DATE nullable), gender(nullable), address(nullable), medical_notes(TEXT nullable — cho clinic), preferred_provider_id(FK nullable), total_bookings(INT default 0), total_spent DECIMAL(15,2 default 0), last_visit_at(nullable), created_at, updated_at

### Payments (1)

#### `payments`
id, booking_id(FK), method('cash'/'bank_transfer'/'momo'/'vnpay'/'card'), amount DECIMAL(15,2), status('pending'/'paid'/'refunded'), gateway_transaction_id(nullable), gateway_response(JSONB nullable), paid_at(nullable), refunded_at(nullable), refund_amount(nullable), created_at, updated_at

### Reviews (1)

#### `reviews`
id, booking_id(FK unique — 1 review/booking), customer_id(FK users), provider_id(FK), service_id(FK), rating(1-5), comment(TEXT nullable), is_visible(default true), admin_reply(nullable), replied_at(nullable), created_at, updated_at

### Common (7)
- `settings` — business_name, business_hours, timezone, booking_advance_days, cancellation_policy_hours
- `media`
- `page_contents` — about, services, pricing, faq
- `contact_submissions`
- `activity_logs`
- `notifications` — booking_confirmed, booking_reminder, booking_cancelled
- `banners`

### Holidays/Closures (1)

#### `holidays`
id, name, date(DATE unique), is_recurring(BOOLEAN default false — hang nam), created_by(FK users), created_at

**Total: 30 tables | ~100 endpoints | 20 modules**

## API Modules (20)

| # | Module | Key Features |
|---|--------|-------------|
| 1-10 | Common (auth, user, role, setting, media, page, contact, log, notification, banner) | Same pattern |
| 11 | service-category | CRUD categories |
| 12 | service | CRUD services (duration, price, capacity) |
| 13 | provider | CRUD staff + working hours + breaks + blocked slots |
| 14 | provider-service | Assign services to providers |
| 15 | booking | Create, confirm, cancel, complete, list, calendar view |
| 16 | availability | Get available slots for service+provider+date |
| 17 | customer-profile | Customer info, history, preferences |
| 18 | payment | Process, refund, status |
| 19 | review | CRUD reviews (1 per booking) |
| 20 | holiday | CRUD holidays/closures |

## Key Endpoints

### Availability (public)
```
GET /availability?serviceId=uuid&providerId=uuid&date=2026-03-26
→ Returns available time slots considering: working hours, breaks, existing bookings, blocked slots, holidays, buffer time
```

### Booking Flow
```
POST /bookings { serviceId, providerId, date, startTime, note }
→ Validates slot available → Creates pending booking → Sends notification
PATCH /bookings/:id/confirm (admin/provider)
PATCH /bookings/:id/cancel { reason }
PATCH /bookings/:id/complete
```
