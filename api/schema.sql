CREATE SCHEMA "public";
CREATE SCHEMA "auth";
CREATE TABLE "book" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"isbn" varchar(13) NOT NULL CONSTRAINT "book_isbn_key" UNIQUE,
	"title" text NOT NULL,
	"cover" text DEFAULT '',
	"publisher" text DEFAULT '',
	"description" text,
	"publishedDate" text,
	"pageCount" integer,
	"language" text,
	"authors" text[] DEFAULT '{}',
	"added_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "book_category" (
	"book_id" uuid,
	"category_id" uuid,
	"main" boolean DEFAULT false NOT NULL,
	CONSTRAINT "primary_key" PRIMARY KEY("book_id","category_id")
);
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL CONSTRAINT "categories_name_key" UNIQUE,
	"added_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "shelf_books" (
	"shelf_id" uuid,
	"book_id" uuid,
	"added_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "shelf_book" PRIMARY KEY("shelf_id","book_id")
);
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL CONSTRAINT "user_name_key" UNIQUE,
	"email" text NOT NULL CONSTRAINT "user_email_key" UNIQUE,
	"password" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE "user_category" (
	"user_id" uuid,
	"category_id" uuid,
	CONSTRAINT "primary" PRIMARY KEY("user_id","category_id")
);
CREATE TABLE "user_shelf" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"is_system" boolean NOT NULL,
	"added_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "shelf_name" UNIQUE("user_id","name")
);
CREATE TABLE "user_reviews" (
	"user_id" uuid,
	"book_id" uuid,
	"rating" integer NOT NULL,
	"review" text,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"display" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"liked" boolean NOT NULL,
	CONSTRAINT "user_book" PRIMARY KEY("user_id","book_id")
);
CREATE INDEX "book_category_index" ON "book_category" ("category_id");
CREATE INDEX "book_index" ON "shelf_books" ("book_id");
CREATE INDEX "user_shelf_index" ON "user_shelf" ("user_id");
CREATE INDEX "book_reviews_index" ON "user_reviews" ("book_id");
ALTER TABLE "book_category" ADD CONSTRAINT "book" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE;
ALTER TABLE "book_category" ADD CONSTRAINT "category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE;
ALTER TABLE "shelf_books" ADD CONSTRAINT "book" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE;
ALTER TABLE "shelf_books" ADD CONSTRAINT "shelf" FOREIGN KEY ("shelf_id") REFERENCES "user_shelf"("id") ON DELETE CASCADE;
ALTER TABLE "user_category" ADD CONSTRAINT "category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE;
ALTER TABLE "user_category" ADD CONSTRAINT "user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
ALTER TABLE "user_shelf" ADD CONSTRAINT "user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
ALTER TABLE "user_reviews" ADD CONSTRAINT "book" FOREIGN KEY ("book_id") REFERENCES "book"("id") ON DELETE CASCADE;
ALTER TABLE "user_reviews" ADD CONSTRAINT "user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;