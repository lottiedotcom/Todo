import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      await redis.set('system_routines', req.body);
      return res.status(200).json({ success: true });
    } else if (req.method === 'GET') {
      const data = await redis.get('system_routines');
      return res.status(200).json(data);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to connect to Upstash' });
  }
}

