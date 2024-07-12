import { Router } from 'express';
import { amoLeadChange } from '../middlewares/amoLeadChange';

const router = Router();

router.post('/lead_change', amoLeadChange);

export default router;
