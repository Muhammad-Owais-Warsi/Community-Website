import to from "await-to-js"
import argon2 from "argon2";
import Admin from '../../models/Admin'
import { ErrorHandler } from "../../../helpers/error";
import constants from "../../../constants";

export default async (req, res, next) => {
  const adminData = {
    ...req.body,
    isSuperAdmin: false,
  };
  adminData.passwordHash = await argon2.hash(adminData.password);
  delete adminData.password;

  // checking whether the logged in user is a SuperAdmin or not
  const { isSuperAdmin } = res.locals.decode;
  if (!isSuperAdmin) {
    const error = new ErrorHandler(constants.ERRORS.INPUT, {
      statusCode: 401,
      message: 'Unauthorized Request: Not a superAdmin',
      user: req.body.email,
    });
    return next(error);
  }

  const [err, user] = await to(Admin.create(adminData));
  if (err) {
    if (err.code === 11000) {
      const error = new ErrorHandler(constants.ERRORS.INPUT, {
        statusCode: 400,
        message: 'Bad request: User already exists',
        user: req.body.email,
        errStack: err,
      });
      return next(error);
    }
    const error = new ErrorHandler(constants.ERRORS.DATABASE, {
      statusCode: 500,
      message: 'Mongo Error: Insertion Failed',
      errStack: err,
      user: req.body.email,
    });
    return next(error);
  }
  // eslint-disable-next-line no-underscore-dangle
  const response = { ...user._doc };
  delete response.passwordHash;
  res.status(200).send(response);
  return next();
};
