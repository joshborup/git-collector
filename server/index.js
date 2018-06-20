const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
require('dotenv').config();

app.use(bodyParser.json());

app.use( session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

app.get('/callback', (req, res) => {
  
  let payload = {
    client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
    code: req.query.code,
    client_secret: process.env.REACT_APP_AUTH0_CLIENT_SECRET,
    grant_type: 'authorization_code',
    redirect_uri: `http://${req.headers.host}/callback`
  }
  
  function exchangeCodeForAccessToken(){
    return axios.post(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`, payload)
  }

  function exchangeAccessTokenForUserInfo(accessTokenResponse){
    const accessToken = accessTokenResponse.data.access_token;
    return axios.get(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/userinfo/?access_token=${accessToken}`) 
  }

  function setUserToSessionGetAuthAccessToken(userInfoResponse){
    req.session.user = userInfoResponse.data
   
    body = {
      grant_type: 'client_credentials',
      client_id: process.env.AUTH0_API_CLIENT_ID,
      client_secret: process.env.AUTH0_API_CLIENT_SECRET,
      audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/`
    }
    return axios.post(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`, body)
  }

  function getGitAccessToken(authAccessTokenResponse){
    let options = {
      headers: {authorization: `Bearer ${authAccessTokenResponse.data.access_token}`}
    }
      return axios.get(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/${req.session.user.sub}`, options)
  }

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
    let onlyPushEvents = response.data.filter((elem) => elem.type == "PushEvent" && elem.payload.commits[0].message.includes('finished:'))
    if(onlyPushEvents = []){
      onlyPushEvents = {message: 'hmmm try a different repository or check your commit message on your github repo page'}
    }
    res.status(200).json(onlyPushEvents)
  }).catch((err) => res.status(200).json({message: 'hmmm try again'}))
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