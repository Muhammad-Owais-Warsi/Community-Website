import to from "await-to-js"
import constants from "../../../constants";
import  {ErrorHandler} from "../../../helpers/error";
import Admin from "../../models/Admin";

export default async (req, res, next) => {
    const { isSuperAdmin } = res.locals.decode;

    if(!isSuperAdmin) {
        const error = new ErrorHandler(constants.ERRORS.INPUT, {
            statusCode: 401,
            message: 'Unauthorized Request: Not a superAdmin',
            user: req.body.email,
        });

        return next(error);
    }

    const id = req.body.id;

    const [err, admin] = await to(Admin.findByIdAndDelete(id));

    if (!admin) {
      const error = new ErrorHandler(constants.ERRORS.INPUT, {
        statusCode: 400,
        message: "Admin doesn't exist",
      });

      return next(error);
    }

    if (err) {
      const error = new ErrorHandler(constants.ERRORS.DATABASE, {
        statusCode: 500,
        message: 'Mongo Error: Deletion Failed',
        errStack: err,
      });

      return next(error);
    }

    return res.status(200).send({
      message: 'Admin deleted successfully',
    });    
}