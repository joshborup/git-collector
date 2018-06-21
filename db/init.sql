DROP TABLE afternoon_projects;
DROP TABLE users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY
    ,sub TEXT NOT NULL
    ,name TEXT NOT NULL
    ,git_hub_name TEXT NOT NULL
    ,picture TEXT NOT NULL
    ,email TEXT NOT NULL
    ,admin BOOLEAN NOT NULL
);


CREATE TABLE afternoon_projects (
    id SERIAL PRIMARY KEY
    , repo_name TEXT NOT NULL
    , repo_url TEXT NOT NULL
    , comments TEXT
    , cohort TEXT
    , user_id INTEGER references users(id)
    , commit_message TEXT
    , created_at TEXT
);


SELECT * FROM users;
SELECT * FROM afternoon_projects;

--  USER OBJECT RETURNED FROM AUTH0 (github);
-- {
-- nickname: 'joshborup',
--   name: 'Joshua D Borup',
--   picture: 'https://avatars3.githubusercontent.com/u/17460334?v=4',
--   updated_at: '2018-06-20T18:34:26.290Z',
--   email: 'joshborup@gmail.com',
--   email_verified: true
-- }

-- REPO OBJECT RETURNED
--   {
--     "id": "7850249482",
--     "type": "PushEvent",
--     "actor": {
--         "id": 17460334,
--         "login": "joshborup",
--         "display_login": "joshborup",
--         "gravatar_id": "",
--         "url": "https://api.github.com/users/joshborup",
--         "avatar_url": "https://avatars.githubusercontent.com/u/17460334?"
--     },
--     "repo": {
--         "id": 137983721,
--         "name": "joshborup/git-collector",
--         "url": "https://api.github.com/repos/joshborup/git-collector"
--     },
--     "payload": {
--         "push_id": 2658520771,
--         "size": 1,
--         "distinct_size": 1,
--         "ref": "refs/heads/master",
--         "head": "cfc861bf4ada30de0c5aa555d33ef5caab895d12",
--         "before": "c9fc2ad2a91dab319dd787b95402e6e95ac0a31b",
--         "commits": [
--             {
--                 "sha": "cfc861bf4ada30de0c5aa555d33ef5caab895d12",
--                 "author": {
--                     "email": "joshborup@gmail.com",
--                     "name": "joshborup"
--                 },
--                 "message": "finished: this is just testing the most recent push",
--                 "distinct": true,
--                 "url": "https://api.github.com/repos/joshborup/git-collector/commits/cfc861bf4ada30de0c5aa555d33ef5caab895d12"
--             }
--         ]
--     },
--     "public": true,
--     "created_at": "2018-06-20T07:56:38Z"
-- }