import { AppDataSource } from '../../config/database.config';
import { LessonProgress } from './entities/lesson-progress.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { NotFoundError } from '../../common/errors/app-error';

export class LessonProgressService {
  private repo = AppDataSource.getRepository(LessonProgress);
  private enrollmentRepo = AppDataSource.getRepository(Enrollment);

  async getProgress(enrollmentId: string, studentId: string) {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id: enrollmentId, studentId } });
    if (!enrollment) throw new NotFoundError('Enrollment');
    return this.repo.find({ where: { enrollmentId }, order: { createdAt: 'ASC' } });
  }

  async markComplete(enrollmentId: string, lessonId: string, studentId: string) {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id: enrollmentId, studentId } });
    if (!enrollment) throw new NotFoundError('Enrollment');

    let progress = await this.repo.findOne({ where: { enrollmentId, lessonId } });

    if (!progress) {
      progress = this.repo.create({ enrollmentId, lessonId, status: 'completed', startedAt: new Date(), completedAt: new Date() });
    } else {
      progress.status = 'completed';
      progress.completedAt = new Date();
      if (!progress.startedAt) progress.startedAt = new Date();
    }

    const saved = await this.repo.save(progress);

    // Update enrollment last lesson and progress
    enrollment.lastLessonId = lessonId;
    await this.enrollmentRepo.save(enrollment);

    // Recalculate progress
    const result = await AppDataSource.query(
      `SELECT
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.status = 'completed') as completed_lessons
       FROM lessons l
       LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.enrollment_id = $1
       WHERE l.course_id = $2 AND l.is_active = true`,
      [enrollmentId, enrollment.courseId],
    );

    const totalLessons = parseInt(result[0]?.total_lessons ?? 0);
    const completedLessons = parseInt(result[0]?.completed_lessons ?? 0);
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    enrollment.progressPercent = progressPercent;
    if (progressPercent === 100) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }
    await this.enrollmentRepo.save(enrollment);

    return saved;
  }

  async updateWatchTime(enrollmentId: string, lessonId: string, studentId: string, watchTimeSeconds: number) {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id: enrollmentId, studentId } });
    if (!enrollment) throw new NotFoundError('Enrollment');

    let progress = await this.repo.findOne({ where: { enrollmentId, lessonId } });

    if (!progress) {
      progress = this.repo.create({ enrollmentId, lessonId, status: 'in_progress', startedAt: new Date(), watchTimeSeconds });
    } else {
      progress.watchTimeSeconds = watchTimeSeconds;
      if (progress.status === 'not_started') {
        progress.status = 'in_progress';
        progress.startedAt = new Date();
      }
    }

    return this.repo.save(progress);
  }
}
