# Database Schema: 04-Landing Page

> Date: 260326 | Database: **PostgreSQL**

## Use Cases
Landing page builder: lead capture, A/B testing, form builder, analytics tracking, CMS sections, email campaigns.

## Tables (25)

### Core Auth (6) — common
- `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `refresh_tokens`

### Pages & Sections (3)

#### `pages`
id, title, slug(unique), description, status('draft'/'published'/'archived'), is_homepage(default false), template('default'/'hero'/'product'/'webinar'/'coming_soon'), meta_title, meta_description, og_image, canonical_url, custom_css(TEXT nullable), custom_js(TEXT nullable), published_at(nullable), created_by(FK users), created_at, updated_at

#### `page_sections`
id, page_id(FK), section_type('hero'/'features'/'pricing'/'testimonials'/'faq'/'cta'/'gallery'/'stats'/'team'/'contact_form'/'custom'), title(nullable), content(JSONB — flexible per section type), sort_order, is_visible(default true), background_color(nullable), background_image(nullable), css_class(nullable), created_at, updated_at

#### `section_templates`
id, name, section_type, description, default_content(JSONB — template content), thumbnail_url(nullable), is_active, sort_order, created_at

### Lead Capture (3)

#### `forms`
id, page_id(FK nullable), name, slug(unique), description, fields(JSONB — [{name,type,label,required,placeholder,options}]), submit_button_text(default 'Submit'), success_message, redirect_url(nullable), notification_email(nullable), is_active, submission_count(default 0), created_at, updated_at

#### `form_submissions`
id, form_id(FK), page_id(FK nullable), data(JSONB — submitted field values), source_url(nullable), utm_source(nullable), utm_medium(nullable), utm_campaign(nullable), utm_term(nullable), utm_content(nullable), ip_address(nullable), user_agent(nullable), referrer(nullable), is_read(default false), created_at

#### `leads`
id, email(unique), name(nullable), phone(nullable), company(nullable), source('form'/'newsletter'/'manual'), status('new'/'contacted'/'qualified'/'converted'/'lost'), score(INT default 0), tags(TEXT[]), notes(TEXT nullable), first_form_id(FK nullable), last_activity_at(nullable), created_at, updated_at

### Pricing (2)

#### `pricing_plans`
id, name, slug(unique), description, price_monthly DECIMAL(15,2), price_yearly(nullable), currency(default 'USD'), features(JSONB — [{text,included:bool}]), is_popular(default false), cta_text(default 'Get Started'), cta_url(nullable), is_active, sort_order, created_at, updated_at

#### `pricing_faqs`
id, question, answer(TEXT), sort_order, is_active, created_at, updated_at

### Testimonials (1)

#### `testimonials`
id, name, title(nullable), company(nullable), avatar_url(nullable), content(TEXT), rating(SMALLINT nullable 1-5), is_featured, is_visible, sort_order, created_at, updated_at

### Analytics (2)

#### `page_views`
id, page_id(FK), session_id(VARCHAR), visitor_id(VARCHAR nullable — cookie), path, referrer(nullable), utm_source, utm_medium, utm_campaign, device_type('desktop'/'mobile'/'tablet'), browser(nullable), country(nullable), duration_seconds(INT nullable), created_at

#### `conversion_events`
id, page_id(FK nullable), form_id(FK nullable), event_type('form_submit'/'cta_click'/'pricing_click'/'scroll_depth'), event_data(JSONB nullable), session_id, visitor_id(nullable), created_at

### Common (6)
- `settings` — site_name, logo_url, favicon_url, google_analytics_id, facebook_pixel_id, custom_head_scripts
- `media`
- `contact_submissions`
- `activity_logs`
- `notifications`
- `banners`

**Total: 25 tables | ~85 endpoints | 18 modules**

## API Modules (18)

| # | Module | Key Features |
|---|--------|-------------|
| 1-6 | Common | auth, user, role, setting, media, notification |
| 7 | page | CRUD pages, publish/unpublish, duplicate |
| 8 | page-section | CRUD sections per page, reorder, toggle visibility |
| 9 | section-template | CRUD templates, list by type |
| 10 | form | CRUD dynamic forms (JSONB fields definition) |
| 11 | form-submission | List submissions, export, mark read |
| 12 | lead | CRUD leads, update status/score, search, filter |
| 13 | pricing-plan | CRUD pricing plans + FAQs |
| 14 | testimonial | CRUD testimonials |
| 15 | analytics | Track page views + conversion events, get stats |
| 16 | contact | Form submissions |
| 17 | activity-log | Admin actions |
| 18 | banner | Promotional banners |
