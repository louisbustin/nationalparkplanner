import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

let dbUrl = env.DATABASE_URL || '';
if (!dbUrl.endsWith('?sslmode=require&channel_binding=require')) {
	dbUrl += '?sslmode=require&channel_binding=require';
}

const client = neon(dbUrl);

export const db = drizzle(client, { schema });
