import express from 'express';
import { getNamesAges, editNameAge, clearNamesAges, addNameAge } from './namesAges';
import morgan from 'morgan';

// Set up web app + port number
const app = express();

app.use(express.json());

// Example get reqest
app.get('/getnamesages', (req, res, next) => {
  try {
    const data = req.query.minAge as string;
    return res.json(getNamesAges(data));
  } catch (err) {
    next(err);
  }
});

app.post('/addnameage', (req, res, next) => {
  try {
    const data = req.body as {name: string, dob: string};
    const result = addNameAge(data.name, data.dob);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

app.put('/editnameage', (req, res, next) => {
  try {
    const data = req.body as {name: string, dob: string};
    const result = editNameAge(data.name, data.dob);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

app.delete('/clear', (req, res, next) => {
  try {
    const data = clearNamesAges();
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

// uses the custom logging and error handling function
app.use(morgan('dev'));

// start server
app.listen(parseInt(process.env.PORT), process.env.HTTP, () => {
  console.log('⚡️ Server listening on port 8080');
});
