import { env } from './config';
import express, { Application } from 'express';
import { apiRouter } from './routes';
import sessions from './middleware/sessions';
import cors from 'cors';
import { isCelebrateError } from 'celebrate';
import { BadRequestError } from './utils/errors';

const corsOptions = {
  credentials: true,
  origin: env.frontendUrl
};

const app: Application = express();
app.use(express.json());
app.use(sessions);
app.set('trust proxy', 1);
app.use(cors(corsOptions));

app.use('/api', apiRouter);

app.get('*', (req, res, next) => {
  const error = new Error('Route does not exist');
  // @ts-ignore
  error.statusCode = 404;
  next(error);
});

// * Error handlers

// Error handling from celebrate
// @ts-ignore
// * https://stackoverflow.com/questions/55954369/how-to-manage-self-created-error-message-instead-of-using-default-celebrate-hap
app.use((error, req, res, next) => {
  if (isCelebrateError(error)) {
    let errorMessage = '';

    if (error.details) {
      for (const [field, errorDetails] of error.details.entries()) {
        errorDetails.details.forEach(({ message }) => {
          errorMessage += `${message}\n`;
        });
      }
    }
    return next(new BadRequestError(errorMessage.trim()));
  }

  return next(error);
});

// @ts-ignore
app.use((error, req, res, next) => {
  // TODO check if sending sensitive errors in prod
  if (error.joi) {
    return res.status(400).json({ error: error.joi.message });
  }

  if (!error.statusCode) error.statusCode = 500;
  res.status(error.statusCode).json({
    error: error.toString()
  });
});

app.listen(env.port, () =>
  console.log(`Server listening on port ${env.port}!`)
);
