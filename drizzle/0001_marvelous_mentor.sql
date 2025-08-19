CREATE TABLE "national_parks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"state" text NOT NULL,
	"description" text,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"established_date" date,
	"area" numeric(10, 2),
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
