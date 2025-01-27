import dotenv from "dotenv";
import to from "await-to-js"
import http from "http";
import {ErrorHandler} from "./helpers/error"
import constants from "./constants"
import cronJob from "./utility/cronJob"
import cluster from "./helpers/cluster";
import joinUs from "./app/models/joinUs"
import contactUs from "./app/models/contactUs"
import sendEmail from "./utility/sendEmail"
import Resource from "./app/models/resource"
import { JoinUsCronJobMailTemplate,ContactUsCronJobMailTemplate,ResourceDeletedMailTemplate } from "./utility/emailTemplates";
import Admin from "./app/models/Admin"
dotenv.config();

// Cron job to delete all resource data for 2months
cronJob('0 0 2 * *', async (req, res, next) => {
  try {
    await Resource.deleteMany({});
    console.log('deleting resource data');
    const [err, response] = await to(Admin.find().select('email username'));
    if (err) {
      const error = new ErrorHandler(constants.ERRORS.DATABASE, {
        statusCode: 500,
        message: 'admin not found',
        errStack: err,
      });
      return next(error);
    }
    try {
      response.map(async (admin) => {
        // eslint-disable-next-line no-unused-expressions, no-sequences
        admin.email, 'Notifcation : Resource data deleted', ResourceDeletedMailTemplate(admin.username);
      });
    } catch (e) {
      const error = new ErrorHandler(constants.ERRORS.EMAIL, {
        statusCode: 500,
        message: 'Sendgrid Error',
        errStack: e,
      });
      return next(error);
    }
  } catch (error) {
    return res.json(error);
  }
  return next();
});
// Running Join Us cronjob for 2 months - 0 0 2 * *
cronJob('0 0 2 * *', async (req, res, next) => {
  try {
    await joinUs.deleteMany({});
    const [err, response] = await to(Admin.find().select('email username'));
    if (err) {
      const error = new ErrorHandler(constants.ERRORS.DATABASE, {
        statusCode: 500,
        message: 'Database Error',
        errStack: err,
      });
      return next(error);
    }

    try {
      response.map(async (adminUser) => {
        await sendEmail(
          adminUser.email,
          'Notification : Join Us Data Removed',
          JoinUsCronJobMailTemplate(adminUser.username)
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
  } catch (err) {
    return err;
  }
  return next();
});

// Running Contact Us cronjob after every 2 months - 0 0 2 * *
cronJob('0 0 2 * *', async (req, res, next) => {
  try {
    await contactUs.deleteMany({});
    const [err, response] = await to(Admin.find().select('email username'));
    if (err) {
      const error = new ErrorHandler(constants.ERRORS.DATABASE, {
        statusCode: 500,
        message: 'Database Error',
        errStack: err,
      });
      return next(error);
    }

    try {
      response.map(async (adminUser) => {
        await sendEmail(
          adminUser.email,
          'Notification : Contact Us Data Removed',
          ContactUsCronJobMailTemplate(adminUser.username)
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
  } catch (err) {
    return err;
  }
  return next();
});

if (cluster().isMaster) return;

const app = require('./app');
/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3500');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      break;
    default:
      console.error(error);
  }
  throw error;
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;

  console.log(
    `Server running in ${process.env.ENV || 'development'} mode on ${bind} for worker ${process.pid}`.brightYellow
      .underline.bold
  );
}

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

export default app;
