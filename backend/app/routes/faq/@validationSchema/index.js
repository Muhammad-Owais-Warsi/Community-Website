import Joi from "joi";

const FAQValidationSchema = Joi.object().keys({
  question: Joi.string().required(),
  answer: Joi.string().required(),
  tags: Joi.array().required(),
});

export default FAQValidationSchema;
