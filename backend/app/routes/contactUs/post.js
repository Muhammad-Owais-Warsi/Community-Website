import to from "await-to-js"
import { ErrorHandler } from "../../../helpers/error";
import constants from "../../../constants";
import contactUs from '../../models/contactUs'
import Admin from '../../models/Admin'
import sendEmail from "../../../utility/sendEmail";
import { ContactUsMailTemplate } from "../../../utility/emailTemplates";


export default async (req, res, next) => {
  const [err] = await to(contactUs.create({ ...req.body }));
  if (err) {
    const error = new ErrorHandler(constants.ERRORS.DATABASE, {
      statusCode: 500,
      message: 'Database Error',
      errStack: err,
    });
    return next(error);
  }

  const [err1, response] = await to(Admin.find().select('email username'));
  if (err1) {
    const error = new ErrorHandler(constants.ERRORS.DATABASE, {
      statusCode: 500,
      message: 'Database Error',
      errStack: err1,
    });
    return next(error);
  }
  try {
    response.map(async (adminUser) => {
      await sendEmail(
        adminUser.email,
        'Notification : New Contact Us Request !',
        ContactUsMailTemplate(adminUser.username, req)
      );
    });
  } catch (e) {
    const error = new ErrorHandler(constants.ERRORS.EMAIL, {
      statusCode: 500,
      message: 'Sendgrid Error',
      errStack: e,
    });
    return next(error);
  }

  res.status(200).send({
    message: 'Contact Request has been added',
  });
  return next();
};
