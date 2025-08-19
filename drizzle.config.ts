import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl.endsWith('?sslmode=require&channel_binding=require')) {
	dbUrl += '?sslmode=require&channel_binding=require';
}

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'postgresql',
	dbCredentials: { url: dbUrl },
	verbose: true,
	strict: true
});
