import express from 'express';

import cors from '../../middleware/cors';
import auth from '../../middleware/auth';
import quizExists from '../../middleware/quizExists';
import quizOwner from '../../middleware/quizOwner';

import getQuizzes from './getQuizzes';
import getQuiz from './getQuiz';

const app = express();
app.use(cors);

app.get('/', auth, getQuizzes);
app.get('/:quizId', auth, quizOwner, getQuiz);

export default app;
