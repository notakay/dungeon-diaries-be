import config from '../config';
import express, { Application } from 'express';
import { apiRouter } from './routes';
import sessions from './middleware/sessions';
import cors from 'cors';

const app: Application = express();
app.use(express.json());
app.use(sessions);
app.use(cors());

app.use('/api', apiRouter);

app.get('*', (req, res, next) => {
  const error = new Error('Route does not exist');
  // @ts-ignore
  error.statusCode = 404;
  next(error);
});

// * Error handler
// @ts-ignore
app.use((error, req, res, next) => {
  // TODO more specific validation message from Joi?
  // TODO also should configure celebratte to use Joi with Full mode instead of partial so that it doesnt fail after checking one field
  if (error.joi) {
    return res.status(400).json({ error: error.joi.message });
  }

  if (!error.statusCode) error.statusCode = 500;
  res.status(error.statusCode).json({
    error: error.toString()
  });
});

app.listen(config.port, () => console.log('server running'));
