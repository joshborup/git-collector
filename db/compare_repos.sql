SELECT * FROM afternoon_projects
WHERE user_id = $1 AND repo_name ILIKE $2;