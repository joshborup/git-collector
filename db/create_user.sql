INSERT INTO users (sub, name, git_hub_name, picture, email, admin) VALUES ($1, $2, $3, $4, $5, $6);
SELECT * FROM users WHERE sub = $1;