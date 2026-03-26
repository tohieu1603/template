# Database Schema: 07-Restaurant

> Date: 260326 | Database: **PostgreSQL**

## Use Cases
Restaurant/F&B: menu management, table reservation, online ordering, kitchen queue, reviews.

## Tables (31)

### Core Auth (6) — common
- `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `refresh_tokens`

### Menu (4)

#### `menu_categories`
id, name, slug(unique), description, image_url, sort_order, is_active, created_at, updated_at

#### `menu_items`
id, category_id(FK), name, slug(unique), description, short_description, image_url, price DECIMAL(15,2), compare_at_price(nullable), currency(default 'VND'), is_available(default true), is_featured, is_vegetarian(default false), is_spicy(default false), spicy_level(SMALLINT nullable 1-5), calories(INT nullable), prep_time_minutes(INT nullable), allergens(TEXT[] nullable), sort_order, meta_title, meta_description, created_at, updated_at

#### `menu_item_options` (size/topping groups)
id, menu_item_id(FK), name('Size','Topping','Extra'), type('single'/'multiple'), is_required(default false), sort_order, created_at

#### `menu_option_values`
id, option_id(FK menu_item_options), name('Small','Medium','Large'), price_modifier DECIMAL(15,2 default 0), is_default(default false), is_available(default true), sort_order, created_at

### Tables & Reservations (3)

#### `tables`
id, table_number(VARCHAR unique), zone(nullable 'indoor','outdoor','vip','bar'), capacity(INT), status('available','occupied','reserved','maintenance'), sort_order, is_active, created_at, updated_at

#### `reservations`
id, customer_id(FK users nullable), customer_name, customer_phone, customer_email(nullable), table_id(FK nullable — auto-assign hoac manual), party_size(INT), reservation_date(DATE), reservation_time(TIME), duration_minutes(INT default 120), status('pending','confirmed','seated','completed','cancelled','no_show'), special_requests(TEXT nullable), confirmed_at(nullable), cancelled_at(nullable), cancel_reason(nullable), created_at, updated_at

#### `reservation_status_history`
id, reservation_id(FK), from_status, to_status, note, changed_by(FK users nullable), created_at

### Orders (4)

#### `orders`
id, customer_id(FK users nullable), table_id(FK nullable), order_number(unique auto-gen ORD-260326-0001), type('dine_in','takeaway','delivery'), status('pending','confirmed','preparing','ready','served','completed','cancelled'), subtotal DECIMAL(15,2), tax_amount DECIMAL(15,2 default 0), discount_amount DECIMAL(15,2 default 0), delivery_fee DECIMAL(15,2 default 0), total DECIMAL(15,2), coupon_id(FK nullable), note(nullable), delivery_address(TEXT nullable), delivery_phone(nullable), payment_method('cash','card','momo','vnpay'), payment_status('pending','paid','refunded'), paid_at(nullable), cancelled_at(nullable), cancel_reason(nullable), estimated_ready_at(nullable), created_at, updated_at

#### `order_items`
id, order_id(FK), menu_item_id(FK), item_name(snapshot), item_price(snapshot DECIMAL), quantity(INT), subtotal DECIMAL(15,2), options(JSONB nullable — selected options snapshot [{optionName,valueName,priceModifier}]), special_instructions(TEXT nullable), status('pending','preparing','ready','served','cancelled'), created_at

#### `order_status_history`
id, order_id(FK), from_status, to_status, note, changed_by(FK users nullable), created_at

#### `coupons`
id, code(unique), type('percent','fixed','free_delivery'), value DECIMAL(15,2), min_order_amount(nullable), max_discount_amount(nullable), usage_limit(nullable), used_count(default 0), starts_at(nullable), expires_at(nullable), is_active, created_at, updated_at

### Payments (1)

#### `payments`
id, order_id(FK), method, amount DECIMAL(15,2), status('pending','paid','failed','refunded'), gateway_transaction_id(nullable), gateway_response(JSONB nullable), paid_at(nullable), refund_amount(nullable), created_at, updated_at

### Reviews (1)

#### `reviews`
id, order_id(FK nullable), customer_id(FK users), rating(1-5), food_rating(SMALLINT nullable 1-5), service_rating(SMALLINT nullable 1-5), ambiance_rating(SMALLINT nullable 1-5), comment(TEXT nullable), is_visible(default true), admin_reply(nullable), replied_at(nullable), created_at, updated_at

### Kitchen (1)

#### `kitchen_queue`
id, order_item_id(FK order_items unique), priority(SMALLINT default 0), station(nullable 'grill','wok','salad','dessert','bar'), started_at(nullable), completed_at(nullable), notes(nullable), created_at

### Operating Hours (1)

#### `operating_hours`
id, day_of_week(0-6), open_time(TIME), close_time(TIME), is_closed(default false), special_note(nullable), created_at, updated_at

### Common (7)
- `settings` — restaurant_name, address, phone, tax_rate, currency, timezone, delivery_radius_km
- `media`, `page_contents`, `contact_submissions`, `activity_logs`, `notifications`, `banners`

**Total: 31 tables | ~110 endpoints | 22 modules**

## API Modules (22)

| # | Module | Key Features |
|---|--------|-------------|
| 1-10 | Common | auth, user, role, setting, media, page, contact, log, notification, banner |
| 11 | menu-category | CRUD |
| 12 | menu-item | CRUD + options + option-values |
| 13 | table | CRUD + status update |
| 14 | reservation | Create, confirm, seat, complete, cancel, no_show + status history |
| 15 | order | Create (dine_in/takeaway/delivery), confirm, prepare, ready, serve, complete, cancel |
| 16 | order-item | Status per item (preparing/ready/served) |
| 17 | coupon | CRUD + apply |
| 18 | payment | Process, refund |
| 19 | review | CRUD + multi-rating (food/service/ambiance) + admin reply |
| 20 | kitchen-queue | List queue, update station, mark complete |
| 21 | operating-hours | CRUD weekly hours |
| 22 | dashboard | Stats: today orders, revenue, popular items, table occupancy |
