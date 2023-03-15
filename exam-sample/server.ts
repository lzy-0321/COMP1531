/**
 * The `express` server for the question asking service.
 * All endpoints return JSON as output.
 */

import express, { json, Request, Response } from 'express';
import morgan from 'morgan';
import { submit, like, dismiss, questions } from './questions';

const app = express();
app.use(json());
// For debugging purposes - logs http requests
app.use(morgan('dev'));

/**
 * Endpoint: '/question/submit'
 * Method: POST
 * Parameter: (question : string)
 * Output: { success : boolean, id : number}
 *
 * Submit the given question. The success output should be true if the question
 * was successfully posted and false otherwise. If success is true then id should
 * be a valid question id.
 */

// Write this endpoint here
app.post('/question/submit', (req: Request, res: Response) => {
    const question = req.body.question;
    try {
        const id = submit(question);
        res.status(200).json({ success: true, id: id });
    } catch (e) {
        res.status(400).json({ success: false, id: -1 });
    }
});

/**
 * Endpoint: '/questions'
 * Method: GET
 * Parameter: ()
 * Output: Question[]
 *
 * List all questions that have been submitted. The ordering of the questions is
 * the same as defined in the backend.
 */

// Write the endpoint here
app.get('/questions', (req: Request, res: Response) => {
    res.status(200).json(questions());
});

/**
 * Endpoint: '/question/like'
 * Method: POST
 * Parameter: (id : number)
 * Output: { success : boolean }
 *
 * Like question with the given id. The success output should be true if the id
 * was a valid question id and false otherwise.
 */

// Write the endpoint here
app.post('/question/like', (req: Request, res: Response) => {
    const id = req.body.id;
    try {
        like(id);
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(400).json({ success: false });
    }
});

/**
 * Endpoint: '/question/dismiss'
 * Method: DELETE
 * Parameter: (id : number)
 * Output: { success : boolean }
 *
 * Dismiss the question with the given id. The success output should be true if
 * the id was a valid question id and false otherwise.
 */

// Write the endpoint here
app.delete('/question/dismiss', (req: Request, res: Response) => {
    const id = req.body.id;
    try {
        dismiss(id);
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(400).json({ success: false });
    }
});

app.listen(8000, () => console.log('Server listening on port 8000'));
