import to from "await-to-js";
import Admin from '../../models/Admin'
import { ErrorHandler } from "../../../helpers/error";
import constants from "../../../constants";

const getAdminsAggregate = (match, page) => {
  const pipeline = [
    { $match: match },
    {
      $project: {
        _id: 0,
        firstName: 1,
        lastName: 1,
        username: 1,
        email: 1,
        contact: 1,
        isSuperAdmin: 1,
      },
    },
    { $skip: constants.PAGINATION_LIMIT.GET_ADMINS * (Number(page) - 1) },
    { $limit: constants.PAGINATION_LIMIT.GET_ADMINS },
  ];
  return pipeline;
};

export default async (req, res, next) => {
  const page = req.query.page || 1;
  const adminType = req.query.type;
  let match = {};
  if (adminType === 'superAdmin') {
    match = {
      isSuperAdmin: true,
    };
  } else if (adminType === 'self') {
    match = {
      email: req.body.email || '',
    };
  }
  const [err, response] = await to(Admin.aggregate(getAdminsAggregate(match, page)));
  if (err) {
    const error = new ErrorHandler(constants.ERRORS.DATABASE, {
      statusCode: '500',
      message: 'The server encountered an unexpected condition which prevented it from fulfilling the request.',
      errStack: err,
    });
    return next(error);
  }
  res.status(200).send(response);
  return next();
};
