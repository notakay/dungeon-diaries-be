import express, { Application } from 'express';
import { apiRouter } from './api';

const app: Application = express();
app.use(express.json());

app.get('/', (_req, res) => res.send('hello'));
app.use('/api', apiRouter);

app.listen(3000, () => console.log('server running'));
