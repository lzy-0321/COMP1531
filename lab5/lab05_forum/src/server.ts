import express, { json, Request, Response } from 'express';
import cors from 'cors';

// OPTIONAL: Use middleware to log (print to terminal) incoming HTTP requests
import morgan from 'morgan';

// Importing the example implementation for echo in echo.js
import { echo } from './echo';
import { port, url } from './config.json';
import { createPostId, addComment, viewPost, clearPosts } from './post';
import { postsList } from './posts';

const PORT: number = parseInt(process.env.PORT || port);

const app = express();

// Use middleware that allows for access from other domains (needed for frontend to connect)
app.use(cors());
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// (OPTIONAL) Use middleware to log (print to terminal) incoming HTTP requests
app.use(morgan('dev'));

// Root URL
app.get('/', (req: Request, res: Response) => {
  console.log('Print to terminal: someone accessed our root url!');
  res.json(
    {
      message: "Welcome to Lab05 Forum Server's root URL!",
    }
  );
});

app.get('/echo/echo', (req: Request, res: Response) => {
  // For GET/DELETE requests, parameters are passed in a query string.
  // You will need to typecast for GET/DELETE requests.
  const message = req.query.message as string;

  // Logic of the echo function is abstracted away in a different
  // file called echo.py.
  res.json(echo(message));
});

app.post('/post/create', (req: Request, res: Response) => {
  // For PUT/POST requests, data is transfered through the JSON body
  const { sender, title, content } = req.body;
  // TODO: Implement
  res.json(createPostId(sender, title, content));
});
// TODO: Remaining routes

app.post('/post/comment', (req: Request, res: Response) => {
  // For PUT/POST requests, data is transfered through the JSON body
  const { postId, sender, comment } = req.body;
  res.json(addComment(postId, sender, comment));
});

app.get('/post/view', (req: Request, res: Response) => {
  const postId = req.query.postId as string;
  res.json(viewPost(parseInt(postId)));
});

app.get('/posts/list', (req: Request, res: Response) => {
  res.json(postsList());
});

app.delete('/clear', (req: Request, res: Response) => {
  res.json(clearPosts());
});

/**
 * Start server
 */
const server = app.listen(PORT, () => {
  console.log(`Starting Express Server at the URL: '${url}:${PORT}'`);
});

/**
 * Handle Ctrl+C gracefully
 */
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
