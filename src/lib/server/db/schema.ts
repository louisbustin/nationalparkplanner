import {
	pgTable,
	text,
	timestamp,
	boolean,
	serial,
	numeric,
	date,
	integer
} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified')
		.$defaultFn(() => false)
		.notNull(),
	image: text('image'),
	createdAt: timestamp('created_at')
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
	updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date())
});

export const nationalParks = pgTable('national_parks', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	state: text('state').notNull(),
	description: text('description'),
	latitude: numeric('latitude', { precision: 10, scale: 8 }),
	longitude: numeric('longitude', { precision: 11, scale: 8 }),
	establishedDate: date('established_date'),
	area: numeric('area', { precision: 10, scale: 2 }), // in square miles
	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});

export const airports = pgTable('airports', {
	id: serial('id').primaryKey(),
	iataCode: text('iata_code').notNull().unique(), // 3-letter code (e.g., LAX)
	icaoCode: text('icao_code').unique(), // 4-letter code (e.g., KLAX)
	name: text('name').notNull(),
	city: text('city').notNull(),
	state: text('state'), // State/region/province
	country: text('country').notNull(),
	latitude: numeric('latitude', { precision: 10, scale: 8 }).notNull(),
	longitude: numeric('longitude', { precision: 11, scale: 8 }).notNull(),
	elevation: integer('elevation'), // feet above sea level
	timezone: text('timezone'), // IANA timezone identifier
	createdAt: timestamp('created_at')
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp('updated_at')
		.$defaultFn(() => new Date())
		.notNull()
});
