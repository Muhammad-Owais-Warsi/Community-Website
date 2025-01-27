import Joi from "joi"

const QuestionValidationSchema = Joi.object().keys({
  title: Joi.string().trim().required().min(5),
  description: Joi.string().trim().required().min(10),
  tags: Joi.array().required(),
});

const updateQuestionStatusSchema = Joi.object().keys({
  id : Joi.string().min(24).max(24).required(),
  status : Joi.boolean().required()
});

export { QuestionValidationSchema, updateQuestionStatusSchema };
