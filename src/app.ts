import express, { Application } from 'express';
import { apiRouter } from './api';
import sessions from './middleware/sessions';

const app: Application = express();
app.use(express.json());
app.use(sessions);

app.get('/', (_req, res) => res.send('hello'));
app.use('/api', apiRouter);

app.listen(3000, () => console.log('server running'));
