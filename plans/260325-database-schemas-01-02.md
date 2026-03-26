# Database Schemas: 01-Ecommerce & 02-Blog

> Date: 260325 | Status: Draft
> Database: **PostgreSQL** (all templates)
> Reference: `/Users/admin/HieuTo/System/post_be` (Blog structure)

---

## 01 - E-COMMERCE

### Triết lý thiết kế
- Product variant **động** (EAV pattern): không hardcode size/color, admin tự tạo attribute
- Ảnh gắn trực tiếp vào variant (không cần bảng product_images riêng)
- **RBAC**: roles + permissions động, không hardcode ENUM
- **JWT**: access + refresh token, token family revocation
- Coupon/discount linh hoạt (%, fixed, free ship)
- Order tracking với state machine
- Review có ảnh + rating

---

### Tables

#### `users`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| email | VARCHAR(255) UNIQUE | |
| password_hash | VARCHAR(255) | bcrypt |
| full_name | VARCHAR(150) | |
| phone | VARCHAR(20) | |
| avatar_url | TEXT | nullable |
| email_verified_at | TIMESTAMPTZ | nullable |
| is_active | BOOLEAN | default true |
| last_login_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `roles`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| name | VARCHAR(50) UNIQUE | vd: 'admin', 'staff', 'customer' |
| display_name | VARCHAR(100) | vd: 'Administrator' |
| description | VARCHAR(255) | nullable |
| is_default | BOOLEAN | default false, role auto-assign khi register |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `permissions`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| name | VARCHAR(100) UNIQUE | vd: 'products.create', 'orders.update' |
| display_name | VARCHAR(150) | |
| group | VARCHAR(50) | nhom: 'products', 'orders', 'users' |
| description | VARCHAR(255) | nullable |
| created_at | TIMESTAMPTZ | |

#### `role_permissions` (pivot)
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| role_id | UUID FK → roles | |
| permission_id | UUID FK → permissions | |
| UNIQUE(role_id, permission_id) | | |

#### `user_roles` (pivot)
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| role_id | UUID FK → roles | |
| UNIQUE(user_id, role_id) | | |
| assigned_at | TIMESTAMPTZ | |

#### `refresh_tokens`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| token_hash | VARCHAR(255) | hashed refresh token |
| family_id | UUID | token family, revoke all tokens in family |
| is_revoked | BOOLEAN | default false |
| expires_at | TIMESTAMPTZ | |
| ip_address | VARCHAR(45) | nullable |
| user_agent | VARCHAR(500) | nullable |
| created_at | TIMESTAMPTZ | |

#### `addresses`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| label | VARCHAR(50) | 'home', 'office', etc |
| recipient_name | VARCHAR(150) | |
| phone | VARCHAR(20) | |
| province | VARCHAR(100) | |
| district | VARCHAR(100) | |
| ward | VARCHAR(100) | |
| street_address | VARCHAR(255) | |
| is_default | BOOLEAN | default false |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `categories`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| parent_id | UUID FK → categories | nullable, nested tree |
| name | VARCHAR(150) | |
| slug | VARCHAR(150) UNIQUE | |
| description | TEXT | nullable |
| image_url | TEXT | nullable |
| sort_order | INT | default 0 |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `brands`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| name | VARCHAR(150) | |
| slug | VARCHAR(150) UNIQUE | |
| logo_url | TEXT | nullable |
| description | TEXT | nullable |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `products`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| category_id | UUID FK → categories | |
| brand_id | UUID FK → brands | nullable |
| name | VARCHAR(255) | |
| slug | VARCHAR(255) UNIQUE | |
| description | TEXT | rich text / HTML |
| short_description | VARCHAR(500) | |
| base_price | DECIMAL(15,2) | giá gốc hiển thị khi chưa chọn variant |
| sku | VARCHAR(100) UNIQUE | mã tổng sản phẩm |
| status | ENUM('draft','active','archived') | |
| is_featured | BOOLEAN | default false |
| meta_title | VARCHAR(255) | SEO |
| meta_description | VARCHAR(500) | SEO |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `attributes` (dynamic: Màu sắc, Size, Chất liệu,...)
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| name | VARCHAR(100) | vd: "Màu sắc", "Size" |
| slug | VARCHAR(100) UNIQUE | |
| type | ENUM('select','color','text') | loại input trên UI |
| sort_order | INT | default 0 |
| created_at | TIMESTAMPTZ | |

#### `attribute_values`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| attribute_id | UUID FK → attributes | |
| value | VARCHAR(150) | vd: "Đỏ", "XL", "Cotton" |
| color_hex | VARCHAR(7) | nullable, chỉ dùng khi type='color' |
| sort_order | INT | default 0 |
| created_at | TIMESTAMPTZ | |

#### `product_variants`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| product_id | UUID FK → products | |
| sku | VARCHAR(100) UNIQUE | mã riêng variant |
| price | DECIMAL(15,2) | giá bán variant |
| compare_at_price | DECIMAL(15,2) | nullable, giá gạch ngang |
| cost_price | DECIMAL(15,2) | nullable, giá vốn |
| stock_quantity | INT | default 0 |
| low_stock_threshold | INT | default 5, cảnh báo sắp hết |
| weight_gram | INT | nullable, tính ship |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `variant_images`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| variant_id | UUID FK → product_variants | |
| url | TEXT | |
| alt_text | VARCHAR(255) | nullable |
| sort_order | INT | default 0 |
| is_primary | BOOLEAN | default false |
| created_at | TIMESTAMPTZ | |

#### `product_variant_attributes` (pivot)
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| variant_id | UUID FK → product_variants | |
| attribute_value_id | UUID FK → attribute_values | |
| UNIQUE(variant_id, attribute_value_id) | | |

#### `coupons`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| code | VARCHAR(50) UNIQUE | |
| type | ENUM('percent','fixed','free_shipping') | |
| value | DECIMAL(15,2) | % hoặc số tiền |
| min_order_amount | DECIMAL(15,2) | nullable |
| max_discount_amount | DECIMAL(15,2) | nullable, cap cho % |
| usage_limit | INT | nullable, tổng lượt dùng |
| usage_per_user | INT | default 1 |
| used_count | INT | default 0 |
| starts_at | TIMESTAMPTZ | |
| expires_at | TIMESTAMPTZ | nullable |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `orders`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| order_number | VARCHAR(30) UNIQUE | auto-gen, vd: ORD-260325-0001 |
| status | ENUM('pending','confirmed','processing','shipping','delivered','cancelled','refunded') | |
| subtotal | DECIMAL(15,2) | tổng trước giảm |
| discount_amount | DECIMAL(15,2) | default 0 |
| shipping_fee | DECIMAL(15,2) | default 0 |
| total | DECIMAL(15,2) | subtotal - discount + shipping |
| coupon_id | UUID FK → coupons | nullable |
| note | TEXT | nullable, ghi chú khách |
| shipping_name | VARCHAR(150) | snapshot địa chỉ |
| shipping_phone | VARCHAR(20) | |
| shipping_address | TEXT | full address snapshot |
| payment_method | ENUM('cod','bank_transfer','momo','vnpay') | |
| payment_status | ENUM('pending','paid','failed','refunded') | |
| paid_at | TIMESTAMPTZ | nullable |
| cancelled_at | TIMESTAMPTZ | nullable |
| cancel_reason | VARCHAR(500) | nullable |
| delivered_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `order_items`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| order_id | UUID FK → orders | |
| product_id | UUID FK → products | |
| variant_id | UUID FK → product_variants | |
| product_name | VARCHAR(255) | snapshot |
| variant_info | VARCHAR(255) | snapshot, vd: "Đỏ / XL" |
| sku | VARCHAR(100) | snapshot |
| price | DECIMAL(15,2) | snapshot giá tại thời điểm mua |
| quantity | INT | |
| subtotal | DECIMAL(15,2) | price * quantity |
| created_at | TIMESTAMPTZ | |

#### `order_status_history`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| order_id | UUID FK → orders | |
| from_status | VARCHAR(30) | |
| to_status | VARCHAR(30) | |
| note | TEXT | nullable |
| changed_by | UUID FK → users | staff/admin |
| created_at | TIMESTAMPTZ | |

#### `reviews`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| product_id | UUID FK → products | |
| user_id | UUID FK → users | |
| order_item_id | UUID FK → order_items | đảm bảo đã mua mới review |
| rating | SMALLINT | 1-5 |
| title | VARCHAR(200) | nullable |
| comment | TEXT | nullable |
| is_verified | BOOLEAN | default true (đã mua) |
| is_visible | BOOLEAN | default true |
| admin_reply | TEXT | nullable |
| replied_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `review_images`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| review_id | UUID FK → reviews | |
| url | TEXT | |
| sort_order | INT | default 0 |
| created_at | TIMESTAMPTZ | |

#### `wishlists`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| product_id | UUID FK → products | |
| UNIQUE(user_id, product_id) | | |
| created_at | TIMESTAMPTZ | |

#### `cart_items`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| variant_id | UUID FK → product_variants | |
| quantity | INT | |
| UNIQUE(user_id, variant_id) | | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `banners`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| title | VARCHAR(200) | |
| image_url | TEXT | |
| link_url | TEXT | nullable |
| position | ENUM('hero','sidebar','popup') | |
| sort_order | INT | default 0 |
| is_active | BOOLEAN | default true |
| starts_at | TIMESTAMPTZ | nullable |
| expires_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `payments`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| order_id | UUID FK → orders | |
| method | VARCHAR(30) | 'cod','bank_transfer','momo','vnpay','sepay' |
| gateway_transaction_id | VARCHAR(255) | nullable, mã GD từ cổng |
| amount | DECIMAL(15,2) | |
| status | VARCHAR(20) | 'pending','success','failed','refunded' |
| gateway_response | JSONB | nullable, raw response từ gateway |
| paid_at | TIMESTAMPTZ | nullable |
| refunded_at | TIMESTAMPTZ | nullable |
| refund_amount | DECIMAL(15,2) | nullable |
| refund_reason | VARCHAR(500) | nullable |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `shipping_methods`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| name | VARCHAR(100) | 'GHN', 'GHTK', 'J&T', 'Self pickup' |
| code | VARCHAR(50) UNIQUE | 'ghn', 'ghtk', 'jt' |
| description | VARCHAR(255) | nullable |
| base_fee | DECIMAL(15,2) | default 0 |
| free_ship_threshold | DECIMAL(15,2) | nullable, min order for free ship |
| estimated_days | VARCHAR(50) | nullable, '2-3 ngay' |
| is_active | BOOLEAN | default true |
| sort_order | INT | default 0 |
| config | JSONB | nullable, API keys, webhook config |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `notifications`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| type | VARCHAR(50) | 'order_status','promotion','review_reply','stock_alert' |
| title | VARCHAR(255) | |
| content | TEXT | |
| data | JSONB | nullable, {orderId, productId,...} deep link |
| is_read | BOOLEAN | default false |
| read_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | |

#### `settings`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| key | VARCHAR(100) UNIQUE | 'site_name','logo_url','contact_phone','seo_title' |
| value | TEXT | |
| type | VARCHAR(20) | 'string','number','boolean','json' |
| group_name | VARCHAR(50) | 'general','seo','payment','shipping','social' |
| description | VARCHAR(255) | nullable |
| updated_at | TIMESTAMPTZ | |

#### `activity_logs`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| user_id | UUID FK → users | nullable |
| action | VARCHAR(20) | 'create','update','delete','login','logout' |
| entity_type | VARCHAR(30) | 'product','order','user','coupon','settings' |
| entity_id | UUID | nullable |
| entity_name | VARCHAR(500) | nullable |
| metadata | JSONB | nullable |
| changes | JSONB | nullable, [{field, oldValue, newValue}] |
| ip_address | VARCHAR(45) | nullable |
| user_agent | VARCHAR(500) | nullable |
| created_at | TIMESTAMPTZ | |

#### `media`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| uploaded_by | UUID FK → users | nullable |
| filename | VARCHAR(255) | |
| original_name | VARCHAR(500) | |
| mime_type | VARCHAR(100) | |
| type | VARCHAR(20) | 'image','video','document','other' |
| size_bytes | BIGINT | |
| url | TEXT | |
| thumbnail_url | TEXT | nullable |
| width | INT | nullable |
| height | INT | nullable |
| alt_text | VARCHAR(500) | nullable |
| folder | VARCHAR(255) | nullable |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `page_contents`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| page_slug | VARCHAR(255) UNIQUE | 'about','terms','privacy','faq' |
| page_name | VARCHAR(255) | |
| content | JSONB | raw JSON content |
| is_active | BOOLEAN | default true |
| meta_title | VARCHAR(255) | nullable, SEO |
| meta_description | VARCHAR(500) | nullable, SEO |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `contact_submissions`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| name | VARCHAR(150) | |
| email | VARCHAR(255) | |
| phone | VARCHAR(20) | nullable |
| subject | VARCHAR(255) | nullable |
| message | TEXT | |
| is_read | BOOLEAN | default false |
| replied_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | |

### E-commerce ERD Summary
```
users ──< user_roles >── roles ──< role_permissions >── permissions
users ──< addresses
users ──< orders ──< order_items >── product_variants
              ──< payments
              ──< order_status_history
users ──< reviews ──< review_images
users ──< wishlists >── products
users ──< cart_items >── product_variants
users ──< notifications
users ──< activity_logs
users ──< media
products ──< product_variants ──< variant_images
                              ──< product_variant_attributes >── attribute_values >── attributes
products >── categories (self-ref parent)
products >── brands
orders >── coupons
shipping_methods (standalone)
settings (key-value)
page_contents (standalone)
contact_submissions (standalone)
banners (standalone)
```

**Tổng: 31 tables**

---

## 02 - BLOG / TIN TỨC

> Ref: `post_be` models — nâng cấp lên PostgreSQL, giữ nguyên domain logic

### Triết lý thiết kế
- **E-E-A-T Author**: CV-like profile (experience, education, certifications, skills, publications)
- **Content blocks**: Notion-style JSON blocks + markdown fallback
- **SEO đầy đủ**: meta, OG, Twitter Card, canonical, robots, schema.org
- **Trending & Social**: view/share/like/comment count, trending rank
- **RBAC**: roles + permissions động
- **JWT**: access + refresh token, token family revocation
- Tag + Category (nested, SEO fields), Series
- Comment nested, Bookmark, Reaction
- Activity log tracking mọi thay đổi
- Media library với assignments + usage tracking

---

### Tables

#### `users`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| email | VARCHAR(255) UNIQUE | |
| password_hash | VARCHAR(255) | |
| full_name | VARCHAR(150) | |
| avatar_url | TEXT | nullable |
| email_verified_at | TIMESTAMPTZ | nullable |
| is_active | BOOLEAN | default true |
| last_login_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `roles`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| name | VARCHAR(50) UNIQUE | 'super_admin','admin','editor','writer','viewer' |
| display_name | VARCHAR(100) | |
| description | VARCHAR(255) | nullable |
| is_default | BOOLEAN | default false |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `permissions`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| name | VARCHAR(100) UNIQUE | 'post:publish', 'post:edit_any', 'media:upload' |
| display_name | VARCHAR(150) | |
| group_name | VARCHAR(50) | group: 'post','category','media','user','seo' |
| description | VARCHAR(255) | nullable |
| created_at | TIMESTAMPTZ | |

#### `role_permissions` (pivot)
| Column | Type | Note |
|--------|------|------|
| role_id | UUID FK → roles | PK composite |
| permission_id | UUID FK → permissions | PK composite |

#### `user_roles` (pivot)
| Column | Type | Note |
|--------|------|------|
| user_id | UUID FK → users | PK composite |
| role_id | UUID FK → roles | PK composite |
| assigned_at | TIMESTAMPTZ | |

#### `refresh_tokens`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| token_hash | VARCHAR(255) | hashed refresh token |
| family_id | UUID | token family, revoke all tokens in family |
| is_revoked | BOOLEAN | default false |
| expires_at | TIMESTAMPTZ | |
| ip_address | VARCHAR(45) | nullable |
| user_agent | VARCHAR(500) | nullable |
| created_at | TIMESTAMPTZ | |

#### `authors` (E-E-A-T)
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| user_id | UUID FK → users | nullable, link to system user |
| name | VARCHAR(200) | |
| slug | VARCHAR(200) UNIQUE | |
| email | VARCHAR(255) | nullable |
| avatar_url | TEXT | nullable |
| bio | TEXT | nullable, expertise description |
| short_bio | VARCHAR(500) | nullable, cho card preview |
| job_title | VARCHAR(200) | nullable |
| company | VARCHAR(200) | nullable |
| location | VARCHAR(200) | nullable |
| expertise | TEXT[] | array tags chuyen mon |
| experience | JSONB | [{company, position, startDate, endDate, isCurrent, description}] |
| education | JSONB | [{school, degree, field, startYear, endYear}] |
| certifications | JSONB | [{name, issuer, issueDate, credentialUrl}] |
| achievements | JSONB | [{title, issuer, date, description}] |
| skills | JSONB | [{name, level, yearsOfExperience}] |
| publications | JSONB | [{title, publisher, date, url}] |
| articles | JSONB | [{title, url, imageUrl, publishedDate}] |
| website | VARCHAR(500) | nullable |
| social_twitter | VARCHAR(200) | nullable |
| social_linkedin | VARCHAR(500) | nullable |
| social_facebook | VARCHAR(500) | nullable |
| social_github | VARCHAR(200) | nullable |
| social_youtube | VARCHAR(500) | nullable |
| same_as | TEXT[] | array URLs for schema.org sameAs |
| meta_title | VARCHAR(255) | SEO |
| meta_description | VARCHAR(500) | SEO |
| is_active | BOOLEAN | default true |
| is_featured | BOOLEAN | default false |
| sort_order | INT | default 0 |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `categories`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| parent_id | UUID FK → categories | nullable, nested tree |
| name | VARCHAR(255) | |
| slug | VARCHAR(255) UNIQUE | |
| description | TEXT | nullable |
| sort_order | INT | default 0 |
| is_active | BOOLEAN | default true |
| view_count | INT | default 0 |
| path | VARCHAR(500) | nullable, vd: /tin-tuc/cong-nghe |
| level | SMALLINT | default 0 |
| seo_title | VARCHAR(70) | nullable |
| seo_description | VARCHAR(160) | nullable |
| og_image | TEXT | nullable |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `tags`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| name | VARCHAR(100) UNIQUE | |
| slug | VARCHAR(100) UNIQUE | |
| description | TEXT | nullable |
| color | VARCHAR(7) | nullable, hex color |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `series`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| author_id | UUID FK → authors | |
| title | VARCHAR(255) | |
| slug | VARCHAR(255) UNIQUE | |
| description | TEXT | nullable |
| cover_image_url | TEXT | nullable |
| status | VARCHAR(20) | 'draft','active','completed' |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `posts`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| author_id | UUID FK → authors | |
| category_id | UUID FK → categories | |
| series_id | UUID FK → series | nullable |
| series_order | INT | nullable |
| title | VARCHAR(500) | |
| subtitle | VARCHAR(500) | nullable |
| slug | VARCHAR(500) UNIQUE | |
| excerpt | TEXT | nullable |
| content | TEXT | markdown / HTML |
| content_blocks | JSONB | nullable, Notion-style blocks |
| content_structure | JSONB | nullable, {toc[], wordCount, readingTime} |
| cover_image | TEXT | nullable |
| status | VARCHAR(20) | 'draft','published','archived' |
| published_at | TIMESTAMPTZ | nullable |
| is_featured | BOOLEAN | default false |
| is_pinned | BOOLEAN | default false |
| allow_comments | BOOLEAN | default true |
| reading_time | INT | nullable, auto-calc |
| view_count | INT | default 0 |
| share_count | INT | default 0 |
| like_count | INT | default 0 |
| comment_count | INT | default 0 |
| is_trending | BOOLEAN | default false |
| trending_rank | SMALLINT | nullable, 1-10 |
| trending_at | TIMESTAMPTZ | nullable |
| is_evergreen | BOOLEAN | default false |
| template | VARCHAR(100) | nullable |
| custom_fields | JSONB | nullable |
| faq | JSONB | nullable, [{question, answer}] |
| meta_title | VARCHAR(255) | SEO |
| meta_description | VARCHAR(500) | SEO |
| meta_keywords | VARCHAR(500) | SEO |
| canonical_url | TEXT | nullable |
| og_title | VARCHAR(255) | nullable |
| og_description | VARCHAR(500) | nullable |
| og_image | TEXT | nullable |
| twitter_title | VARCHAR(255) | nullable |
| twitter_description | VARCHAR(500) | nullable |
| twitter_image | TEXT | nullable |
| robots | VARCHAR(100) | default 'index,follow' |
| news_keywords | VARCHAR(500) | nullable |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `post_tags` (pivot)
| Column | Type | Note |
|--------|------|------|
| post_id | UUID FK → posts | PK composite |
| tag_id | UUID FK → tags | PK composite |

#### `post_revisions`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| post_id | UUID FK → posts | |
| title | VARCHAR(500) | snapshot |
| content | TEXT | snapshot |
| content_blocks | JSONB | nullable, snapshot |
| revised_by | UUID FK → users | |
| revision_note | VARCHAR(300) | nullable |
| created_at | TIMESTAMPTZ | |

#### `comments`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| post_id | UUID FK → posts | |
| user_id | UUID FK → users | |
| parent_id | UUID FK → comments | nullable, nested reply |
| content | TEXT | |
| is_approved | BOOLEAN | default true |
| is_edited | BOOLEAN | default false |
| likes_count | INT | default 0 |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `comment_likes`
| Column | Type | Note |
|--------|------|------|
| comment_id | UUID FK → comments | PK composite |
| user_id | UUID FK → users | PK composite |
| created_at | TIMESTAMPTZ | |

#### `reactions`
| Column | Type | Note |
|--------|------|------|
| post_id | UUID FK → posts | PK composite |
| user_id | UUID FK → users | PK composite |
| type | VARCHAR(20) | 'like','love','insightful','funny','sad' |
| created_at | TIMESTAMPTZ | |

#### `bookmarks`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| post_id | UUID FK → posts | |
| collection_id | UUID FK → bookmark_collections | nullable |
| UNIQUE(user_id, post_id) | | |
| created_at | TIMESTAMPTZ | |

#### `bookmark_collections`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| name | VARCHAR(100) | |
| is_public | BOOLEAN | default false |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `banners`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| post_id | UUID FK → posts UNIQUE | 1 banner/post |
| category_id | UUID FK → categories | nullable |
| title | VARCHAR(200) | |
| subtitle | VARCHAR(300) | nullable |
| image_url | TEXT | |
| link_url | VARCHAR(500) | |
| position | VARCHAR(20) | 'hero','sidebar','category','footer' |
| rank | SMALLINT | default 0, 0-10 |
| sort_order | INT | default 0 |
| status | VARCHAR(20) | 'active','inactive' |
| is_auto_assigned | BOOLEAN | default true |
| view_count | INT | default 0 |
| click_count | INT | default 0 |
| start_date | TIMESTAMPTZ | nullable |
| end_date | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `media`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| uploaded_by | UUID FK → users | nullable |
| filename | VARCHAR(255) | |
| original_name | VARCHAR(500) | |
| mime_type | VARCHAR(100) | |
| type | VARCHAR(20) | 'image','video','document','audio','other' |
| size_bytes | BIGINT | |
| url | TEXT | |
| thumbnail_url | TEXT | nullable |
| width | INT | nullable |
| height | INT | nullable |
| title | VARCHAR(500) | nullable |
| alt_text | VARCHAR(500) | nullable |
| caption | TEXT | nullable |
| folder | VARCHAR(255) | nullable |
| used_in | JSONB | nullable, [{entityType, entityId, field}] |
| assignments | JSONB | nullable, [{pageSlug, sectionKey, elementId}] |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `page_contents` (static pages)
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| page_slug | VARCHAR(255) UNIQUE | |
| page_name | VARCHAR(255) | |
| content | JSONB | raw JSON content |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `activity_logs`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| user_id | UUID FK → users | nullable |
| action | VARCHAR(20) | 'create','update','delete','publish','unpublish','login','logout','upload' |
| entity_type | VARCHAR(30) | 'post','category','tag','media','user','settings' |
| entity_id | UUID | nullable |
| entity_name | VARCHAR(500) | nullable |
| metadata | JSONB | nullable |
| changes | JSONB | nullable, [{field, oldValue, newValue}] |
| ip_address | VARCHAR(45) | nullable |
| user_agent | VARCHAR(500) | nullable |
| created_at | TIMESTAMPTZ | |

#### `notifications`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| type | VARCHAR(50) | 'comment_reply','new_post','mention','system' |
| title | VARCHAR(255) | |
| content | TEXT | |
| data | JSONB | nullable, {postId, commentId,...} deep link |
| is_read | BOOLEAN | default false |
| read_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | |

#### `settings`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| key | VARCHAR(100) UNIQUE | 'site_name','logo_url','analytics_id','seo_title' |
| value | TEXT | |
| type | VARCHAR(20) | 'string','number','boolean','json' |
| group_name | VARCHAR(50) | 'general','seo','social','analytics' |
| description | VARCHAR(255) | nullable |
| updated_at | TIMESTAMPTZ | |

#### `redirects`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| from_path | VARCHAR(500) UNIQUE | source URL path |
| to_path | VARCHAR(500) | destination URL path |
| status_code | SMALLINT | 301 or 302 |
| is_active | BOOLEAN | default true |
| hit_count | INT | default 0 |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

#### `newsletters`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| email | VARCHAR(255) UNIQUE | |
| name | VARCHAR(150) | nullable |
| is_subscribed | BOOLEAN | default true |
| subscribed_at | TIMESTAMPTZ | |
| unsubscribed_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | |

#### `contact_submissions`
| Column | Type | Note |
|--------|------|------|
| id | UUID PK | |
| name | VARCHAR(150) | |
| email | VARCHAR(255) | |
| subject | VARCHAR(255) | nullable |
| message | TEXT | |
| is_read | BOOLEAN | default false |
| replied_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | |

### Blog ERD Summary
```
users ──< user_roles >── roles ──< role_permissions >── permissions
users ──< authors (E-E-A-T, JSONB CV fields)
authors ──< posts ──< post_tags >── tags
authors ──< series ──< posts (series_order)
posts >── categories (self-ref parent, SEO fields)
posts ──< comments (self-ref parent) ──< comment_likes >── users
posts ──< reactions >── users
posts ──< bookmarks >── bookmark_collections >── users
posts ──< post_revisions
posts ──< banners (1-1)
users ──< media (JSONB used_in/assignments)
users ──< activity_logs
users ──< notifications
settings (key-value)
redirects (standalone)
newsletters (standalone)
contact_submissions (standalone)
```

**Tổng: 27 tables**

---

## Unresolved Questions

1. **E-commerce**: Cần thêm multi-currency / multi-language?
2. **E-commerce**: Payment integration cụ thể nào? (VNPay, MoMo, SePay?)
3. **Chung**: Cần soft delete (deleted_at) cho tất cả tables?
