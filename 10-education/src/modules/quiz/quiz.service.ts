import { AppDataSource } from '../../config/database.config';
import { Quiz } from './entities/quiz.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto, UpdateQuestionDto, SubmitQuizDto } from './dto/quiz.dto';
import { NotFoundError, UnprocessableError } from '../../common/errors/app-error';
import { buildPaginationMeta } from '../../common/dto/pagination.dto';

export class QuizService {
  private quizRepo = AppDataSource.getRepository(Quiz);
  private questionRepo = AppDataSource.getRepository(QuizQuestion);
  private attemptRepo = AppDataSource.getRepository(QuizAttempt);

  async findAll(query: any) {
    const { page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;
    const [items, total] = await this.quizRepo.createQueryBuilder('q').orderBy('q.createdAt', 'DESC').limit(limit).offset(offset).getManyAndCount();
    return { items, meta: buildPaginationMeta(page, limit, total) };
  }

  async findById(id: string) {
    const quiz = await this.quizRepo.findOne({ where: { id } });
    if (!quiz) throw new NotFoundError('Quiz');
    const questions = await this.questionRepo.find({ where: { quizId: id }, order: { sortOrder: 'ASC' } });
    return { ...quiz, questions };
  }

  async findByLesson(lessonId: string) {
    const quiz = await this.quizRepo.findOne({ where: { lessonId } });
    if (!quiz) throw new NotFoundError('Quiz');
    const questions = await this.questionRepo.find({ where: { quizId: quiz.id }, order: { sortOrder: 'ASC' } });
    return { ...quiz, questions };
  }

  async create(dto: CreateQuizDto) {
    const quiz = this.quizRepo.create(dto);
    return this.quizRepo.save(quiz);
  }

  async update(id: string, dto: UpdateQuizDto) {
    const quiz = await this.quizRepo.findOne({ where: { id } });
    if (!quiz) throw new NotFoundError('Quiz');
    Object.assign(quiz, dto);
    return this.quizRepo.save(quiz);
  }

  async delete(id: string) {
    const quiz = await this.quizRepo.findOne({ where: { id } });
    if (!quiz) throw new NotFoundError('Quiz');
    await this.quizRepo.remove(quiz);
  }

  async addQuestion(quizId: string, dto: CreateQuestionDto) {
    const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
    if (!quiz) throw new NotFoundError('Quiz');
    const question = this.questionRepo.create({ ...dto, quizId });
    return this.questionRepo.save(question);
  }

  async updateQuestion(questionId: string, dto: UpdateQuestionDto) {
    const question = await this.questionRepo.findOne({ where: { id: questionId } });
    if (!question) throw new NotFoundError('Question');
    Object.assign(question, dto);
    return this.questionRepo.save(question);
  }

  async deleteQuestion(questionId: string) {
    const question = await this.questionRepo.findOne({ where: { id: questionId } });
    if (!question) throw new NotFoundError('Question');
    await this.questionRepo.remove(question);
  }

  async submitAttempt(quizId: string, studentId: string, dto: SubmitQuizDto) {
    const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
    if (!quiz) throw new NotFoundError('Quiz');

    // Check attempt count
    const attemptCount = await this.attemptRepo.count({ where: { quizId, studentId } });
    if (attemptCount >= quiz.maxAttempts) {
      throw new UnprocessableError(`Maximum ${quiz.maxAttempts} attempts reached`);
    }

    const questions = await this.questionRepo.find({ where: { quizId } });
    let totalPoints = 0;
    let earnedPoints = 0;
    const gradedAnswers: any[] = [];

    for (const answer of dto.answers) {
      const question = questions.find((q) => q.id === answer.questionId);
      if (!question) continue;
      totalPoints += question.points;

      const correctOptions = question.options.filter((o: any) => o.isCorrect).map((o: any) => o.text);
      const isCorrect = correctOptions.includes(answer.answer);
      if (isCorrect) earnedPoints += question.points;

      gradedAnswers.push({ questionId: answer.questionId, answer: answer.answer, isCorrect });
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= quiz.passingScore;

    const attempt = this.attemptRepo.create({
      quizId,
      studentId,
      score,
      passed,
      answers: gradedAnswers,
      startedAt: new Date(),
      completedAt: new Date(),
    });

    return this.attemptRepo.save(attempt);
  }

  async getAttempts(quizId: string, studentId: string) {
    return this.attemptRepo.find({ where: { quizId, studentId }, order: { createdAt: 'DESC' } });
  }
}
