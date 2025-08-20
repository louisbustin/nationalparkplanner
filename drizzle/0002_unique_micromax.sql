CREATE TABLE "airports" (
	"id" serial PRIMARY KEY NOT NULL,
	"iata_code" text NOT NULL,
	"icao_code" text,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"state" text,
	"country" text NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"elevation" integer,
	"timezone" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "airports_iata_code_unique" UNIQUE("iata_code"),
	CONSTRAINT "airports_icao_code_unique" UNIQUE("icao_code")
);
