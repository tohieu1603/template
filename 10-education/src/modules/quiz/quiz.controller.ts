import { Request, Response, NextFunction } from 'express';
import { QuizService } from './quiz.service';
import { successResponse } from '../../common/dto/api-response.dto';

const quizService = new QuizService();

export const listQuizzes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await quizService.findAll(req.query);
    res.json(successResponse(result.items, undefined, result.meta));
  } catch (error) { next(error); }
};

export const getQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quiz = await quizService.findById(req.params.id);
    res.json(successResponse(quiz));
  } catch (error) { next(error); }
};

export const getQuizByLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quiz = await quizService.findByLesson(req.params.lessonId);
    res.json(successResponse(quiz));
  } catch (error) { next(error); }
};

export const createQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quiz = await quizService.create(req.body);
    res.status(201).json(successResponse(quiz, 'Quiz created'));
  } catch (error) { next(error); }
};

export const updateQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quiz = await quizService.update(req.params.id, req.body);
    res.json(successResponse(quiz, 'Quiz updated'));
  } catch (error) { next(error); }
};

export const deleteQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await quizService.delete(req.params.id);
    res.json(successResponse(null, 'Quiz deleted'));
  } catch (error) { next(error); }
};

export const addQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await quizService.addQuestion(req.params.id, req.body);
    res.status(201).json(successResponse(question, 'Question added'));
  } catch (error) { next(error); }
};

export const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await quizService.updateQuestion(req.params.questionId, req.body);
    res.json(successResponse(question, 'Question updated'));
  } catch (error) { next(error); }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await quizService.deleteQuestion(req.params.questionId);
    res.json(successResponse(null, 'Question deleted'));
  } catch (error) { next(error); }
};

export const submitAttempt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await quizService.submitAttempt(req.params.id, req.user!.id, req.body);
    res.json(successResponse(result, result.passed ? 'Quiz passed!' : 'Quiz submitted'));
  } catch (error) { next(error); }
};

export const getAttempts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attempts = await quizService.getAttempts(req.params.id, req.user!.id);
    res.json(successResponse(attempts));
  } catch (error) { next(error); }
};
