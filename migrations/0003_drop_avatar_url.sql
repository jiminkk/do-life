-- Drop the avatar_url column (custom uploads descoped; only bsky_avatar_url is used)
ALTER TABLE users DROP COLUMN avatar_url;
