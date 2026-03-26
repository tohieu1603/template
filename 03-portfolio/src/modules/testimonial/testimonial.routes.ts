import { Router } from 'express';
import { listTestimonials, getTestimonial, createTestimonial, updateTestimonial, deleteTestimonial } from './testimonial.controller';
import { validateDto } from '../../common/middleware/validate.middleware';
import { auth } from '../../common/middleware/auth.middleware';
import { rbac } from '../../common/middleware/rbac.middleware';
import { CreateTestimonialDto, UpdateTestimonialDto, TestimonialQueryDto } from './dto/testimonial.dto';

const router = Router();

router.get('/', validateDto(TestimonialQueryDto, 'query'), listTestimonials);
router.get('/:id', getTestimonial);
router.post('/', auth(), rbac('testimonials.create'), validateDto(CreateTestimonialDto), createTestimonial);
router.put('/:id', auth(), rbac('testimonials.update'), validateDto(UpdateTestimonialDto), updateTestimonial);
router.delete('/:id', auth(), rbac('testimonials.delete'), deleteTestimonial);

export default router;
