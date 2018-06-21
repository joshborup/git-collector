INSERT INTO afternoon_projects (repo_name, repo_url, comments, cohort, user_id, commit_message, created_at)
VALUES (${repo_name}, ${repo_url}, ${comments}, ${cohort}, ${user_id}, ${commit_message}, ${created_at});
SELECT * FROM afternoon_projects;

