/**
 * The `express` server for 'Brooms'.
 * All endpoints return JSON as output.
 */

import express, { json, Request, Response } from 'express';
import morgan from 'morgan';
import { get_users, add_user, get_messages, send_message, clear } from './brooms';

const app = express();
app.use(json());
// For debugging purposes - logs http requests
app.use(morgan('dev'));

/**
 * 
 * Endpoint: '/users'
 * Method: GET
 * Parameters: ()
 * Output: { 'users': string[] }
 * Returns a list of all the users as a list of strings.
 */

// Write this endpoint here
app.get('/users', (req: Request, res: Response) => {
  res.json(get_users());
});

/**
 * Endpoint: '/users'
 * Method: POST
 * Parameters: (name: string)
 * Output: {}
 * Adds a user to the room/broom.
 */

// Write the endpoint here
app.post('/users', (req: Request, res: Response) => {
  const name = req.body.name as string;
  add_user(name);
  res.json({});
});

/**
 * Endpoint: '/message'
 * Method: GET
 * Parameters: ()
 * Output: { messages: Message[] }
 * Returns a list of all the messages sent, who they came from, and who they are going to.
 */

// Write the endpoint here
app.get('/message', (req: Request, res: Response) => {
  res.json(get_messages());
});

/**
 * Endpoint: '/message'
 * Method: POST
 * Parameters: (user_from: string, user_to: string, message: string)
 * Output: {}
 * Sends a message from user `user_from` to user `user_to`.
 */

// Write the endpoint here
app.post('/message', (req: Request, res: Response) => {
  const user_from = req.body.user_from as string;
  const user_to = req.body.user_to as string;
  const message = req.body.message as string;
  send_message(user_from, user_to, message);
  res.json({});
});

/**
 * Endpoint: '/clear'
 * Method: DELETE
 * Parameters: ()
 * Output: {}
 * Clears the database.
 */

// Write the endpoint here
app.delete('/clear', (req: Request, res: Response) => {
  clear();
  res.json({});
});

app.listen(8080, () => console.log('Server listening on port 8080'));
