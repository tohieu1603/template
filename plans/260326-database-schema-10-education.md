# Database Schema: 10-Education

> Date: 260326 | Database: **PostgreSQL**

## Use Cases
LMS/Education platform: online courses, lessons, quizzes, enrollments, certificates, instructor management.

## Tables (30)

### Core Auth (6) — common
- `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `refresh_tokens`

### Instructors (1)
#### `instructors`
id, user_id(FK unique), name, slug(unique), bio, short_bio, avatar_url, expertise(TEXT[]), website, social_linkedin, social_youtube, is_verified(default false), is_active, rating_avg DECIMAL(3,2 default 0), total_students(INT default 0), total_courses(INT default 0), created_at, updated_at

### Courses (4)
#### `course_categories`
id, parent_id(FK self nullable), name, slug(unique), description, image_url, sort_order, is_active, created_at, updated_at

#### `courses`
id, instructor_id(FK), category_id(FK), title, slug(unique), subtitle, description(TEXT), short_description, thumbnail_url, preview_video_url(nullable), level('beginner'/'intermediate'/'advanced'/'all'), language(default 'vi'), price DECIMAL(15,2), compare_at_price(nullable), currency(default 'VND'), is_free(default false), duration_hours DECIMAL(5,1 nullable), total_lessons(INT default 0), total_enrollments(INT default 0), rating_avg DECIMAL(3,2 default 0), status('draft'/'published'/'archived'), is_featured, is_bestseller(default false), requirements(JSONB nullable — [strings]), what_you_learn(JSONB nullable — [strings]), meta_title, meta_description, published_at(nullable), created_at, updated_at

#### `course_sections` (modules/chapters)
id, course_id(FK), title, description(nullable), sort_order, is_active, created_at, updated_at

#### `lessons`
id, section_id(FK), course_id(FK), title, slug, content_type('video'/'article'/'quiz'/'assignment'), content(TEXT nullable — article HTML), video_url(nullable), video_duration_seconds(INT nullable), is_free_preview(default false), sort_order, is_active, created_at, updated_at

### Quizzes (3)
#### `quizzes`
id, lesson_id(FK unique), title, description, passing_score(INT default 70), time_limit_minutes(INT nullable), max_attempts(INT default 3), is_active, created_at, updated_at

#### `quiz_questions`
id, quiz_id(FK), question(TEXT), question_type('single_choice'/'multiple_choice'/'true_false'/'short_answer'), options(JSONB — [{text,isCorrect}]), explanation(TEXT nullable), points(INT default 1), sort_order, created_at

#### `quiz_attempts`
id, quiz_id(FK), student_id(FK users), score(INT), passed(BOOLEAN), answers(JSONB — [{questionId,answer,isCorrect}]), started_at, completed_at(nullable), created_at

### Enrollments & Progress (3)
#### `enrollments`
id, course_id(FK), student_id(FK users), status('active'/'completed'/'expired'/'refunded'), enrolled_at, completed_at(nullable), expires_at(nullable), progress_percent(INT default 0), last_lesson_id(FK nullable), created_at, updated_at

#### `lesson_progress`
id, enrollment_id(FK), lesson_id(FK), status('not_started'/'in_progress'/'completed'), started_at(nullable), completed_at(nullable), watch_time_seconds(INT default 0), UNIQUE(enrollment_id, lesson_id), created_at, updated_at

#### `certificates`
id, enrollment_id(FK unique), student_id(FK), course_id(FK), certificate_number(unique auto-gen), issued_at, pdf_url(nullable), created_at

### Payments (1)
#### `payments`
id, enrollment_id(FK), student_id(FK), course_id(FK), amount DECIMAL(15,2), discount_amount DECIMAL(15,2 default 0), total DECIMAL(15,2), method('bank_transfer'/'momo'/'vnpay'/'card'), status('pending'/'paid'/'failed'/'refunded'), coupon_id(FK nullable), gateway_transaction_id(nullable), paid_at(nullable), created_at, updated_at

### Coupons (1)
#### `coupons`
id, code(unique), type('percent'/'fixed'), value DECIMAL(15,2), min_course_price(nullable), max_discount(nullable), usage_limit(nullable), used_count(default 0), course_id(FK nullable — specific course), starts_at, expires_at, is_active, created_at, updated_at

### Reviews (1)
#### `reviews`
id, course_id(FK), student_id(FK), enrollment_id(FK), rating(1-5), comment(TEXT nullable), is_visible(default true), admin_reply(nullable), UNIQUE(enrollment_id), created_at, updated_at

### Common (7)
- `settings`, `media`, `page_contents`, `contact_submissions`, `activity_logs`, `notifications`, `banners`

**Total: 30 tables | ~105 endpoints | 22 modules**

## API Modules (22)
| # | Module | Key Features |
|---|--------|-------------|
| 1-10 | Common | auth, user, role, setting, media, page, contact, log, notification, banner |
| 11 | instructor | CRUD profiles, verify |
| 12 | course-category | CRUD (nested tree) |
| 13 | course | CRUD, publish/unpublish, search, filter (level/category/price/rating) |
| 14 | course-section | CRUD sections per course |
| 15 | lesson | CRUD lessons per section (video/article/quiz) |
| 16 | quiz | CRUD quizzes + questions, submit attempt, get results |
| 17 | enrollment | Enroll, list my courses, progress tracking |
| 18 | lesson-progress | Mark lesson complete, get progress |
| 19 | certificate | Generate, download, verify |
| 20 | payment | Process, refund |
| 21 | coupon | CRUD + apply |
| 22 | review | CRUD (1 per enrollment) + admin reply |
