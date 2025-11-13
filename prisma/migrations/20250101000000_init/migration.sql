-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "twitter_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "is_blue_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_type" TEXT,
    "profile_picture" TEXT,
    "cover_picture" TEXT,
    "description" TEXT,
    "location" TEXT,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "following" INTEGER NOT NULL DEFAULT 0,
    "can_dm" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TEXT,
    "favourites_count" INTEGER NOT NULL DEFAULT 0,
    "has_custom_timelines" BOOLEAN NOT NULL DEFAULT false,
    "is_translator" BOOLEAN NOT NULL DEFAULT false,
    "media_count" INTEGER NOT NULL DEFAULT 0,
    "statuses_count" INTEGER NOT NULL DEFAULT 0,
    "possibly_sensitive" BOOLEAN NOT NULL DEFAULT false,
    "is_automated" BOOLEAN NOT NULL DEFAULT false,
    "automated_by" TEXT,
    "profile_bio_description" TEXT,
    "profile_bio_url" TEXT,
    "next_auth_user_id" TEXT,
    "created_at_db" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_twitter_id_key" ON "users"("twitter_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_name_key" ON "users"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_next_auth_user_id_key" ON "users"("next_auth_user_id");

-- CreateIndex
CREATE INDEX "users_twitter_id_idx" ON "users"("twitter_id");

-- CreateIndex
CREATE INDEX "users_user_name_idx" ON "users"("user_name");

-- CreateIndex
CREATE INDEX "users_next_auth_user_id_idx" ON "users"("next_auth_user_id");

