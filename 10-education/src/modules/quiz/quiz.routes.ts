import { Router } from 'express';
import { listQuizzes, getQuiz, getQuizByLesson, createQuiz, updateQuiz, deleteQuiz, addQuestion, updateQuestion, deleteQuestion, submitAttempt, getAttempts } from './quiz.controller';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { validateDto } from '../../common/middleware/validate.middleware';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto, UpdateQuestionDto, SubmitQuizDto } from './dto/quiz.dto';

/**
 * @swagger
 * tags:
 *   name: Quizzes
 *   description: Quiz management and attempts
 */
const router = Router();

router.get('/', auth(), listQuizzes);
router.get('/lesson/:lessonId', auth(), getQuizByLesson);
router.get('/:id', auth(), getQuiz);
router.get('/:id/attempts', auth(), getAttempts);
router.post('/', auth(), rbac('quizzes.create'), validateDto(CreateQuizDto), createQuiz);
router.put('/:id', auth(), rbac('quizzes.update'), validateDto(UpdateQuizDto), updateQuiz);
router.delete('/:id', auth(), rbac('quizzes.delete'), deleteQuiz);
router.post('/:id/questions', auth(), rbac('quizzes.update'), validateDto(CreateQuestionDto), addQuestion);
router.put('/:id/questions/:questionId', auth(), rbac('quizzes.update'), validateDto(UpdateQuestionDto), updateQuestion);
router.delete('/:id/questions/:questionId', auth(), rbac('quizzes.update'), deleteQuestion);
router.post('/:id/submit', auth(), validateDto(SubmitQuizDto), submitAttempt);
router.post('/:id/attempts', auth(), validateDto(SubmitQuizDto), submitAttempt);

export default router;
