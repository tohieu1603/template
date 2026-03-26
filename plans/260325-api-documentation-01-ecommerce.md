# 01-Ecommerce API Documentation

> Base URL: `http://localhost:3000/api/v1`
> Auth: Bearer JWT token in `Authorization` header
> Swagger: `http://localhost:3000/api/v1/docs`

---

## Response Format

All endpoints return:
```json
{
  "success": true|false,
  "data": {...} | [...],
  "message": "...",
  "meta": { "page": 1, "limit": 10, "total": 100, "totalPages": 10 }
}
```

## Auth Legend

| Icon | Meaning |
|------|---------|
| -- | Public (no auth) |
| AUTH | Requires JWT token |
| RBAC | Requires JWT + specific permission |

---

## 1. AUTH (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | -- | Register new user |
| POST | `/auth/login` | -- | Login, get tokens |
| POST | `/auth/refresh` | -- | Refresh access token |
| POST | `/auth/logout` | -- | Revoke refresh token |
| GET | `/auth/me` | AUTH | Get current user profile |

### POST `/auth/register`
```json
// Request
{ "email": "user@example.com", "password": "Pass@123", "fullName": "John Doe", "phone": "0901234567" }

// Response 201
{
  "success": true,
  "data": { "user": { "id": "uuid", "email": "...", "fullName": "...", "isActive": true } },
  "message": "Registration successful"
}
```

### POST `/auth/login`
```json
// Request
{ "email": "user@example.com", "password": "Pass@123" }

// Response 200
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "fullName": "...", "roles": ["customer"] },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  },
  "message": "Login successful"
}
```

### POST `/auth/refresh`
```json
// Request
{ "refreshToken": "eyJ..." }

// Response 200
{ "success": true, "data": { "accessToken": "eyJ...", "refreshToken": "eyJ..." }, "message": "Token refreshed" }
```

### POST `/auth/logout`
```json
// Request
{ "refreshToken": "eyJ..." }

// Response 200
{ "success": true, "message": "Logged out" }
```

---

## 2. USERS (`/users`) — RBAC: `users.*`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | RBAC `users.view` | List users (paginated, search) |
| POST | `/users` | RBAC `users.create` | Create user (admin) |
| GET | `/users/:id` | RBAC `users.view` | Get user detail |
| PUT | `/users/:id` | RBAC `users.update` | Update user |
| DELETE | `/users/:id` | RBAC `users.delete` | Delete user |
| PUT | `/users/me/password` | AUTH | Change own password |
| POST | `/users/:id/roles/:roleId` | RBAC `users.update` | Assign role to user |
| DELETE | `/users/:id/roles/:roleId` | RBAC `users.update` | Remove role from user |

### GET `/users?page=1&limit=10&search=john&status=active`
```json
// Response 200
{
  "success": true,
  "data": [{ "id": "uuid", "email": "...", "fullName": "...", "isActive": true, "createdAt": "..." }],
  "meta": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 }
}
```

### POST `/users`
```json
// Request
{ "email": "staff@shop.com", "password": "Pass@123", "fullName": "Staff One", "phone": "090..." }
```

---

## 3. ROLES & PERMISSIONS (`/roles`) — RBAC: `roles.*`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/roles` | RBAC `roles.view` | List roles |
| POST | `/roles` | RBAC `roles.create` | Create role |
| GET | `/roles/:id` | RBAC `roles.view` | Get role + permissions |
| PUT | `/roles/:id` | RBAC `roles.update` | Update role |
| DELETE | `/roles/:id` | RBAC `roles.delete` | Delete role |
| PUT | `/roles/:id/permissions` | RBAC `roles.update` | Assign permissions to role |
| GET | `/roles/permissions/all` | RBAC `roles.view` | List all permissions |
| POST | `/roles/permissions` | RBAC `roles.create` | Create permission |
| DELETE | `/roles/permissions/:id` | RBAC `roles.delete` | Delete permission |

### POST `/roles`
```json
// Request
{ "name": "editor", "displayName": "Editor", "description": "Can edit products" }
```

### PUT `/roles/:id/permissions`
```json
// Request
{ "permissionIds": ["uuid1", "uuid2", "uuid3"] }
```

---

## 4. CATEGORIES (`/categories`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | -- | List categories (paginated) |
| GET | `/categories/tree` | -- | Get nested category tree |
| GET | `/categories/:id` | -- | Get category detail |
| POST | `/categories` | RBAC `categories.create` | Create category |
| PUT | `/categories/:id` | RBAC `categories.update` | Update category |
| DELETE | `/categories/:id` | RBAC `categories.delete` | Delete category |

### GET `/categories?search=phone&page=1&limit=10`

### POST `/categories`
```json
// Request
{ "name": "Smartphones", "slug": "smartphones", "parentId": "uuid-parent", "description": "...", "imageUrl": "..." }

// Response 201 — tree response:
{
  "data": [
    { "id": "...", "name": "Electronics", "children": [
      { "id": "...", "name": "Smartphones", "children": [] },
      { "id": "...", "name": "Laptops", "children": [
        { "id": "...", "name": "Gaming Laptops", "children": [] }
      ]}
    ]}
  ]
}
```

---

## 5. BRANDS (`/brands`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/brands` | -- | List brands |
| GET | `/brands/:id` | -- | Get brand |
| POST | `/brands` | RBAC `brands.create` | Create brand |
| PUT | `/brands/:id` | RBAC `brands.update` | Update brand |
| DELETE | `/brands/:id` | RBAC `brands.delete` | Delete brand |

### POST `/brands`
```json
{ "name": "Apple", "slug": "apple", "logoUrl": "https://...", "description": "..." }
```

---

## 6. ATTRIBUTES (`/attributes`) — Dynamic product attributes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/attributes` | -- | List attributes |
| GET | `/attributes/:id` | -- | Get attribute + values |
| POST | `/attributes` | RBAC `attributes.create` | Create attribute |
| PUT | `/attributes/:id` | RBAC `attributes.update` | Update attribute |
| DELETE | `/attributes/:id` | RBAC `attributes.delete` | Delete attribute |
| POST | `/attributes/:id/values` | RBAC `attributes.update` | Add attribute value |
| DELETE | `/attributes/:id/values/:valueId` | RBAC `attributes.update` | Remove value |

### POST `/attributes`
```json
{ "name": "Color", "slug": "color", "type": "color" }
// type: "select" | "color" | "text"
```

### POST `/attributes/:id/values`
```json
{ "value": "Black", "colorHex": "#000000", "sortOrder": 0 }
```

### GET `/attributes/:id` — Response
```json
{
  "data": {
    "id": "uuid", "name": "Color", "type": "color",
    "values": [
      { "id": "uuid", "value": "Black", "colorHex": "#000000" },
      { "id": "uuid", "value": "White", "colorHex": "#FFFFFF" }
    ]
  }
}
```

---

## 7. PRODUCTS (`/products`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | -- | List products (paginated, search, filter) |
| GET | `/products/:id` | -- | Get product + variants + attributes + images |
| GET | `/products/slug/:slug` | -- | Get product by slug |
| POST | `/products` | RBAC `products.create` | Create product (optional inline variants) |
| PUT | `/products/:id` | RBAC `products.update` | Update product |
| DELETE | `/products/:id` | RBAC `products.delete` | Delete product |
| POST | `/products/:id/variants` | RBAC `products.update` | Add variant |
| PUT | `/products/:id/variants/:variantId` | RBAC `products.update` | Update variant |
| DELETE | `/products/:id/variants/:variantId` | RBAC `products.update` | Delete variant |

### GET `/products?search=iphone&status=active&categoryId=uuid&brandId=uuid&minPrice=100&maxPrice=2000&featured=true&page=1&limit=10`

### POST `/products` — With inline variants
```json
{
  "name": "iPhone 16 Pro",
  "slug": "iphone-16-pro",
  "categoryId": "uuid",
  "brandId": "uuid",
  "basePrice": 999,
  "sku": "IPH16PRO",
  "status": "active",
  "isFeatured": true,
  "description": "<p>HTML content</p>",
  "shortDescription": "A18 Pro chip",
  "metaTitle": "SEO title",
  "metaDescription": "SEO description",
  "variants": [
    {
      "sku": "IPH16-BLK-128",
      "price": 999,
      "compareAtPrice": 1099,
      "costPrice": 750,
      "stockQuantity": 50,
      "weightGram": 199,
      "attributeValueIds": ["uuid-black", "uuid-128gb"],
      "images": [
        { "url": "https://img.com/black.jpg", "altText": "Black", "isPrimary": true }
      ]
    }
  ]
}
```

### GET `/products/:id` — Response
```json
{
  "data": {
    "id": "uuid",
    "name": "iPhone 16 Pro",
    "slug": "iphone-16-pro",
    "basePrice": "999.00",
    "status": "active",
    "variants": [
      {
        "id": "uuid",
        "sku": "IPH16-BLK-128",
        "price": "999.00",
        "compareAtPrice": "1099.00",
        "stockQuantity": 50,
        "images": [{ "url": "...", "altText": "...", "isPrimary": true }],
        "attributeValues": [
          { "id": "uuid", "value": "Black", "colorHex": "#000", "attribute_name": "Color" },
          { "id": "uuid", "value": "128GB", "attribute_name": "Storage" }
        ]
      }
    ]
  }
}
```

---

## 8. CART (`/cart`) — AUTH required

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | AUTH | Get cart with subtotal |
| POST | `/cart` | AUTH | Add item to cart |
| PUT | `/cart/:id` | AUTH | Update quantity (by item ID or variant ID) |
| DELETE | `/cart/:id` | AUTH | Remove item (by item ID or variant ID) |
| DELETE | `/cart` | AUTH | Clear entire cart |

### POST `/cart`
```json
{ "variantId": "uuid", "quantity": 2 }
```

### GET `/cart` — Response
```json
{
  "data": {
    "items": [
      { "id": "uuid", "variant_id": "uuid", "quantity": 2, "price": "999.00", "product_name": "iPhone 16 Pro", "sku": "IPH16-BLK-128" }
    ],
    "subtotal": "1998.00",
    "itemCount": 1
  }
}
```

---

## 9. ORDERS (`/orders`) — AUTH required

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/orders` | AUTH | List user's orders (admin sees all) |
| POST | `/orders` | AUTH | Create order from cart |
| GET | `/orders/:id` | AUTH | Get order detail + items + history |
| PUT | `/orders/:id/status` | RBAC `orders.update` | Update order status (admin) |
| POST | `/orders/:id/cancel` | AUTH | Cancel own order |

### POST `/orders`
```json
{
  "items": [{ "variantId": "uuid", "quantity": 2 }],
  "shippingName": "John Doe",
  "shippingPhone": "0901234567",
  "shippingAddress": "123 Le Loi, Q1, HCM",
  "paymentMethod": "cod",
  "couponCode": "SAVE20",
  "note": "Please deliver before 5pm"
}
```

### PUT `/orders/:id/status` (admin)
```json
{ "status": "confirmed", "note": "Order verified" }
// Statuses: pending → confirmed → processing → shipping → delivered
//           pending → cancelled | any → refunded
```

---

## 10. PAYMENTS (`/payments`) — AUTH required

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/payments` | RBAC `payments.view` | List all payments |
| GET | `/payments/order/:orderId` | AUTH | Get payments for order |
| POST | `/payments` | AUTH | Process payment |
| POST | `/payments/:id/refund` | RBAC `payments.update` | Refund payment |

### POST `/payments`
```json
{ "orderId": "uuid", "method": "bank_transfer", "gatewayTransactionId": "TXN123" }
```

### POST `/payments/:id/refund`
```json
{ "amount": 500.00, "reason": "Customer returned item" }
```

---

## 11. COUPONS (`/coupons`) — RBAC: `coupons.*`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/coupons/apply` | AUTH | Validate & calculate discount |
| GET | `/coupons` | RBAC `coupons.view` | List coupons |
| POST | `/coupons` | RBAC `coupons.create` | Create coupon |
| GET | `/coupons/:id` | RBAC `coupons.view` | Get coupon |
| PUT | `/coupons/:id` | RBAC `coupons.update` | Update coupon |
| DELETE | `/coupons/:id` | RBAC `coupons.delete` | Delete coupon |

### POST `/coupons`
```json
{
  "code": "SAVE20",
  "type": "percent",
  "value": 20,
  "minOrderAmount": 50,
  "maxDiscountAmount": 100,
  "usageLimit": 1000,
  "usagePerUser": 1,
  "startsAt": "2026-01-01",
  "expiresAt": "2026-12-31",
  "isActive": true
}
// type: "percent" | "fixed" | "free_shipping"
```

### POST `/coupons/apply`
```json
// Request
{ "code": "SAVE20", "orderAmount": 200 }

// Response
{ "data": { "valid": true, "discount": 40, "type": "percent", "message": "Coupon applied" } }
```

---

## 12. REVIEWS (`/reviews`) — AUTH for write

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reviews?productId=uuid` | -- | List reviews for product |
| GET | `/reviews/stats/:productId` | -- | Get rating stats |
| GET | `/reviews/:id` | -- | Get review detail |
| POST | `/reviews` | AUTH | Create review |
| PUT | `/reviews/:id` | AUTH | Update own review |
| PATCH | `/reviews/:id/admin` | RBAC `reviews.update` | Admin reply/visibility |
| DELETE | `/reviews/:id` | AUTH | Delete own review |

### POST `/reviews`
```json
{ "productId": "uuid", "orderItemId": "uuid", "rating": 5, "title": "Great!", "comment": "Love it" }
```

### PATCH `/reviews/:id/admin`
```json
{ "isVisible": false, "adminReply": "Thank you for your feedback" }
```

---

## 13. WISHLIST (`/wishlist`) — AUTH required

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/wishlist` | AUTH | Get user's wishlist |
| POST | `/wishlist/:productId` | AUTH | Toggle wishlist (add/remove) |
| GET | `/wishlist/:productId/check` | AUTH | Check if product in wishlist |

---

## 14. ADDRESSES (`/addresses`) — AUTH required

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/addresses` | AUTH | List user's addresses |
| POST | `/addresses` | AUTH | Create address |
| GET | `/addresses/:id` | AUTH | Get address |
| PUT | `/addresses/:id` | AUTH | Update address |
| DELETE | `/addresses/:id` | AUTH | Delete address |
| PATCH | `/addresses/:id/default` | AUTH | Set as default |

### POST `/addresses`
```json
{
  "label": "home",
  "recipientName": "John Doe",
  "phone": "0901234567",
  "province": "Ho Chi Minh",
  "district": "Quan 1",
  "ward": "Phuong Ben Nghe",
  "streetAddress": "123 Le Loi",
  "isDefault": true
}
```

---

## 15. BANNERS (`/banners`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/banners` | -- | List active banners |
| GET | `/banners/:id` | -- | Get banner |
| POST | `/banners` | RBAC `banners.create` | Create banner |
| PUT | `/banners/:id` | RBAC `banners.update` | Update banner |
| DELETE | `/banners/:id` | RBAC `banners.delete` | Delete banner |

### POST `/banners`
```json
{ "title": "Summer Sale", "imageUrl": "https://...", "linkUrl": "/sale", "position": "hero", "isActive": true, "startsAt": "2026-06-01", "expiresAt": "2026-08-31" }
// position: "hero" | "sidebar" | "popup"
```

---

## 16. SHIPPING METHODS (`/shipping-methods`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/shipping-methods` | -- | List active shipping methods |
| GET | `/shipping-methods/:id` | -- | Get method detail |
| POST | `/shipping-methods` | RBAC `shipping_methods.create` | Create method |
| PUT | `/shipping-methods/:id` | RBAC `shipping_methods.update` | Update method |
| DELETE | `/shipping-methods/:id` | RBAC `shipping_methods.delete` | Delete method |

### POST `/shipping-methods`
```json
{ "name": "Express", "code": "express", "description": "2-3 days", "baseFee": 12.99, "freeShipThreshold": 100, "estimatedDays": "2-3 days", "isActive": true }
```

---

## 17. NOTIFICATIONS (`/notifications`) — AUTH required

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | AUTH | List user's notifications |
| PATCH | `/notifications/:id/read` | AUTH | Mark as read |
| PATCH | `/notifications/read-all` | AUTH | Mark all as read |
| DELETE | `/notifications/:id` | AUTH | Delete notification |

---

## 18. SETTINGS (`/settings`) — RBAC: `settings.*`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/settings/public` | -- | Get public settings |
| GET | `/settings` | RBAC `settings.view` | List all settings |
| POST | `/settings` | RBAC `settings.create` | Create setting |
| GET | `/settings/:key` | RBAC `settings.view` | Get by key |
| PUT | `/settings/:key` | RBAC `settings.update` | Update setting |
| PUT | `/settings/bulk` | RBAC `settings.update` | Bulk update |
| DELETE | `/settings/:key` | RBAC `settings.delete` | Delete setting |

### POST `/settings`
```json
{ "key": "site_name", "value": "My Store", "type": "string", "groupName": "general" }
// type: "string" | "number" | "boolean" | "json"
```

---

## 19. MEDIA (`/media`) — AUTH required

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/media` | RBAC `media.view` | List media |
| GET | `/media/:id` | AUTH | Get media detail |
| POST | `/media/upload` | AUTH | Upload file (multipart) |
| PUT | `/media/:id` | RBAC `media.update` | Update alt/folder |
| DELETE | `/media/:id` | RBAC `media.delete` | Delete media |

### POST `/media/upload` (multipart/form-data)
```
file: <binary>
folder: "products"
altText: "Product image"
```

---

## 20. PAGES (`/pages`) — Static content pages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/pages/slug/:slug` | -- | Get page by slug (public) |
| GET | `/pages` | RBAC `pages.view` | List pages |
| POST | `/pages` | RBAC `pages.create` | Create page |
| GET | `/pages/:id` | RBAC `pages.view` | Get page by ID |
| PUT | `/pages/:id` | RBAC `pages.update` | Update page |
| DELETE | `/pages/:id` | RBAC `pages.delete` | Delete page |

### POST `/pages`
```json
{ "pageSlug": "about", "pageName": "About Us", "content": { "hero": "Welcome", "body": "..." }, "metaTitle": "About", "metaDescription": "..." }
```

---

## 21. CONTACTS (`/contacts`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/contacts` | -- | Submit contact form (public) |
| GET | `/contacts` | RBAC `contacts.view` | List submissions |
| GET | `/contacts/:id` | RBAC `contacts.view` | Get detail |
| PATCH | `/contacts/:id/read` | RBAC `contacts.update` | Mark as read |
| DELETE | `/contacts/:id` | RBAC `contacts.delete` | Delete |

### POST `/contacts`
```json
{ "name": "John", "email": "john@test.com", "phone": "090...", "subject": "Help", "message": "I need support" }
```

---

## 22. ACTIVITY LOGS (`/activity-logs`) — RBAC: `activity_logs.view`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/activity-logs` | RBAC `activity_logs.view` | List all activity logs |

### GET `/activity-logs?page=1&limit=20&action=create&entityType=product`

---

## RBAC Permission Matrix

| Permission Group | view | create | update | delete |
|-----------------|------|--------|--------|--------|
| users | x | x | x | x |
| roles | x | x | x | x |
| products | x | x | x | x |
| categories | x | x | x | x |
| brands | x | x | x | x |
| attributes | x | x | x | x |
| orders | x | x | x | x |
| payments | x | x | x | x |
| coupons | x | x | x | x |
| reviews | x | x | x | x |
| banners | x | x | x | x |
| shipping_methods | x | x | x | x |
| settings | x | x | x | x |
| media | x | x | x | x |
| pages | x | x | x | x |
| contacts | x | x | x | x |
| activity_logs | x | x | x | x |
| notifications | x | x | x | x |

**Seeded roles:**
- `super_admin` — all permissions
- `admin` — all except *.delete
- `staff` — *.view only
- `customer` — default, no admin permissions

---

## Quick Start

```bash
cd 01-ecommerce
cp .env.example .env        # Fill DB credentials + JWT secrets
npm install
npm run seed                 # Create roles, permissions, admin user
npm run dev                  # http://localhost:3000/api/v1/docs
```

**Admin login:** `admin@example.com` / `Admin@123`

**Total: 22 modules | 90+ endpoints | 31 database tables**
