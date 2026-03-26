# Database Schema: 03-Portfolio

> Date: 260325 | Database: **PostgreSQL**

## Tables (28)

### Core Auth (6) — common
- `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `refresh_tokens`

### Profile (4)
- **profiles**: slug, full_name, title, tagline, bio, avatar_url, cover_image_url, resume_url, email, phone, location, is_available, availability_text, social_* (github/linkedin/twitter/dribbble/behance/youtube/instagram), meta_title, meta_description, is_primary, sort_order
- **experiences**: profile_id, type('work'/'education'/'volunteer'), title, organization, location, start_date, end_date, is_current, description, sort_order
- **skills**: profile_id, name, category('frontend'/'backend'/'design'/'devops'/'soft_skill'), level(1-100), years_experience, icon_url, sort_order
- **certifications**: profile_id, name, issuer, issue_date, expiry_date, credential_id, credential_url, image_url, sort_order

### Projects (5)
- **project_categories**: name, slug, description, sort_order, is_active
- **technologies**: name(unique), slug, color(hex), icon_url
- **projects**: profile_id, category_id, title, slug, subtitle, description, short_description, cover_image_url, client_name, client_logo_url, project_url, source_url, start_date, end_date, duration_text, role_in_project, status, is_featured, is_case_study, case_study_content, sort_order, view_count, SEO
- **project_technologies**: project_id + technology_id (pivot)
- **project_images**: project_id, url, thumbnail_url, alt_text, caption, type('image'/'video'/'embed'), embed_url, sort_order, is_cover

### Services (1)
- **services**: profile_id, title, slug, description, short_description, icon, price_type('fixed'/'hourly'/'project'/'contact'), price_from, price_to, currency, is_featured, is_active, sort_order

### Testimonials (1)
- **testimonials**: profile_id, project_id(nullable), client_name, client_title, client_company, client_avatar_url, content, rating(1-5), is_featured, is_visible, sort_order

### Blog (4)
- **blog_categories**, **blog_tags**, **blog_posts**(profile_id, category_id, title, slug, content, status, published_at, reading_time, view_count, is_featured, SEO), **blog_post_tags**(pivot)

### Common (7) — settings, media, page_contents, contact_submissions(enriched: budget_range, project_type, timeline), activity_logs, notifications, banners

**Total: 28 tables | ~95 endpoints | 18 modules**
