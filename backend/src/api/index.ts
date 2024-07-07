import { Router } from 'express';
import raExpressMongoose from 'express-mongoose-ra-json-server';
import messageModel from '../models/message.model';
import userModel from '../models/user.model';
import { sendMessage } from '../middlewares/sendMessage';
import { sheetUpdate } from '../middlewares/sheetUpdate'

const router = Router();

router.use(
  '/users',
  raExpressMongoose(userModel, {
    q: ['phone', 'chatId', 'username'],
    allowedRegexFields: ['phone', 'chatId', 'username', 'name'],
    useLean: false,
  })
);

router.use('/messages', raExpressMongoose(messageModel, { q: ['message'] }));

router.post('/send-message', sendMessage);

router.post('/sheet-update', sheetUpdate);

export default router;
