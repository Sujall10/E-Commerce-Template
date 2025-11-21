import { createClient, type RedisClientType } from 'redis';

let client: RedisClientType | null = null;

async function getRedisClient(): Promise<RedisClientType> {
  if (client && client.isOpen) {
    return client;
  }

  client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  client.on('error', (err) => console.error('Redis Client Error', err));
  client.on('reconnecting', () => console.log('Redis reconnecting...'));

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}

export default getRedisClient();
