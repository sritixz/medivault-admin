import express from 'express';
import { SubscriptionTransaction } from '../models/SubscriptionTransaction.js';
import { User } from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [transactions, freeCount, premiumCount] = await Promise.all([
      SubscriptionTransaction.find().sort({ createdAt: -1 }).lean(),
      User.countDocuments({ plan: 'free' }),
      User.countDocuments({ plan: 'family_premium' }),
    ]);

    const mrrInr = transactions
      .filter((t) => t.status === 'Success')
      .reduce((sum, t) => sum + t.amountInr, 0);

    res.json({
      plans: [
        {
          id: 'free',
          name: 'Free Health Locker',
          priceInr: 0,
          usersCount: freeCount,
        },
        {
          id: 'family_premium',
          name: 'Family Care Premium',
          priceInrPerMember: 499,
          usersCount: premiumCount,
          mrrInr,
        },
      ],
      transactions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
