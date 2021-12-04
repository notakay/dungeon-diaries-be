import config from '../config';
import express, { Application } from 'express';
import { apiRouter } from './api';
import sessions from './middleware/sessions';
import cors from 'cors';

const app: Application = express();
app.use(express.json());
app.use(sessions);
app.use(cors());

app.get('/', (_req, res) => res.send('hello'));
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
  if (!error.statusCode) error.statusCode = 500;
  res.status(error.statusCode).json({
    error: error.toString()
  });
});

app.listen(config.port, () => console.log('server running'));
