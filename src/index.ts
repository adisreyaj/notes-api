import { serve } from '@hono/node-server';
import * as dotenv from 'dotenv';
import { Context, Hono } from 'hono';
import { logger } from 'hono/logger';
import { RowDataPacket } from 'mysql2/promise';
import { database } from './db.js';

dotenv.config();

const app = new Hono();
app.use(logger());

const db = await database();

app.get('/', async (c: Context) => {
  const [topNotes] = await db.query(
    'SELECT * FROM notes ORDER BY id DESC LIMIT 10',
  );

  c;
  return c.json({
    notes: topNotes,
  });
});

app.get('/health', async (c: Context) => {
  return c.json({
    status: 'ok',
  });
});

app.get('/count', async (c: Context) => {
  const [count] = await db.query<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM notes',
  );
  return c.json({
    count: count[0]?.count,
  });
});

app.post('/', async (c: Context) => {
  const { name, note } = await c.req.json();

  await db.query('INSERT INTO notes (name, note) VALUES (?, ?)', [name, note]);

  c.status(201);
  return c.json({
    message: 'Success',
  });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

console.log(`Server is running on port http://0.0.0.0:${port}`);

serve({
  fetch: app.fetch,
  port: port,
});
