ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(100);

UPDATE users
SET username = CASE
    WHEN POSITION('@' IN email) > 1 THEN SPLIT_PART(email, '@', 1)
    ELSE email
END
WHERE username IS NULL;

ALTER TABLE users
ALTER COLUMN username SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username
ON users (username);
