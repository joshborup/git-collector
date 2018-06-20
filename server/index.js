const express = require('express');
const app = express();

app.get('/callback', (req, res) => {

  function setGitTokenToSessions(gitAccessToken){
    req.session.access_token = gitAccessToken.data.identities[0].access_token
    res.redirect('/')
  }

  exchangeCodeForAccessToken()
  .then(accessTokenResponse => exchangeAccessTokenForUserInfo(accessTokenResponse))
  .then(userInfoResponse => setUserToSessionGetAuthAccessToken(userInfoResponse))
  .then(authAccessTokenResponse => getGitAccessToken(authAccessTokenResponse))
  .then(gitAccessToken => setGitTokenToSessions(gitAccessToken))
  .catch(err =>  console.log(err))      
})


app.get('/api/:gitUser/:gitRepo', (req, res) => {
  const { gitUser, gitRepo } = req.params;
  console.log( gitUser, gitRepo );
  axios.get(`https://api.github.com/repos/${gitUser}/${gitRepo}/events?access_token=${req.session.access_token}`).then(response => {
    let onlyPushEvents = response.data.filter((elem) => elem.type == "PushEvent")
    
    res.status(200).json({onlyPushEvents: onlyPushEvents, response: response.data})
  }).catch((err) => console.log(err))
})

app.get('/api/user-data', (req, res) => {
  res.status(200).json(req.session.user)
})

app.get('/api/logout', (req, res) => {
  req.session.destroy();
  res.send('logged out');
})

const port = 4000;
app.listen( port, () => { console.log(`Server listening on port ${port}`); } );