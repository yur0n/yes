import express from 'express';
import { connect } from 'mongoose';
import { environment } from './environments/environment';
import apiRoutes from './api';
import amoRoutes from './amo';
import morgan from 'morgan';
import cors from 'cors';

import './bots/bot'
import './bots/amo_bot'

const app = express();

connect(environment.DB_URL, {});

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(morgan('dev'));
app.use(cors());
app.use((req, res, next) => {
  //X-Total-Count in the Access-Control-Expose-Headers
  res.header('Access-Control-Expose-Headers', 'X-Total-Count');
  next();
});
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   next();
// });
app.use('/api', apiRoutes);
app.use('/amo', amoRoutes);

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server up at ${PORT}`);
});
server.on('error', console.error);