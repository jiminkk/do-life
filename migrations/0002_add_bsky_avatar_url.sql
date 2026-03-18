-- Add bsky_avatar_url column for Bluesky-fetched avatars
ALTER TABLE users ADD COLUMN bsky_avatar_url TEXT;

-- Move existing avatar_url values (which are all from Bluesky) to bsky_avatar_url
UPDATE users SET bsky_avatar_url = avatar_url, avatar_url = NULL WHERE avatar_url IS NOT NULL;
