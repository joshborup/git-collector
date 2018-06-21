const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const axios = require('axios');
const massive = require('massive')
const app = express();
const pgSession = require('connect-pg-simple')(session);

require('dotenv').config();

app.use(bodyParser.json());




massive(process.env.CONNECTION_STRING).then(db => {
  console.log('database connected')
  app.set('db', db)
})

app.use(session({
  store: new pgSession({
      conString:process.env.CONNECTION_STRING
      }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 }, // 14 days            
}))

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
   
    const {sub, name, nickname, picture, email,} = userInfoResponse.data
    const db = req.app.get('db');
    let body = {
      grant_type: 'client_credentials',
      client_id: process.env.AUTH0_API_CLIENT_ID,
      client_secret: process.env.AUTH0_API_CLIENT_SECRET,
      audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/`
    }

      db.authenticate_user(sub).then(dbResponse => {
          if(!dbResponse.length){
              db.create_user([sub, name, nickname, picture, email, false]).then(user => {
                axios.post(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`, body).then(response => {
                  req.session.user = user[0]

                  let options = {
                    headers: {authorization: `Bearer ${response.data.access_token}`}
                  }
              
                  axios.get(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/${req.session.user.sub}`, options).then(myresponse => {
                    req.session.access_token = myresponse.data.identities[0].access_token
                    res.redirect('/')
                  })

                  })
              }).catch(err => console.log('err :', err))
          } else {
            axios.post(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`, body).then(response => {
                req.session.user = dbResponse[0];

                let options = {
                  headers: {authorization: `Bearer ${response.data.access_token}`}
                }
            
                axios.get(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/${req.session.user.sub}`, options).then(myresponse => {
                  req.session.access_token = myresponse.data.identities[0].access_token
                  res.redirect('/')
                })

              })
          }

      }).catch(err => console.log(err));

   
  }

  exchangeCodeForAccessToken()
  .then(accessTokenResponse => exchangeAccessTokenForUserInfo(accessTokenResponse))
  .then(userInfoResponse => setUserToSessionGetAuthAccessToken(userInfoResponse))
  .catch(err =>  console.log(err))      
})

app.post('/api/:gitUser/:gitRepo', (req, res) => {
  const db = req.app.get('db')
  const { gitUser, gitRepo } = req.params;
  const { cohort, comments } = req.body;
  console.log( gitUser, gitRepo, cohort, comments );
  axios.get(`https://api.github.com/repos/${gitUser}/${gitRepo}/events?access_token=${req.session.access_token}`).then(response => {
    let onlyPushEvents = response.data.filter((elem) => elem.type == "PushEvent")
    console.log(onlyPushEvents.length);
    if(!onlyPushEvents.length){
      onlyPushEvents = [{message: 'hmmm try a different repository or check your commit message on your github repo page'}]
      res.status(200).json(onlyPushEvents[0])
    }else {
      console.log('onlyPushEvents[0] :', onlyPushEvents[0]);
      let repoObj = {
        repo_name: onlyPushEvents[0].repo.name,
        repo_url: onlyPushEvents[0].repo.url,
        comments: comments,
        cohort: cohort,
        user_id: req.session.user.id,
        commit_message: onlyPushEvents[0].payload.commits[0].message,
        created_at: onlyPushEvents[0].created_at
      }
      
      console.log('repoObj :', repoObj);
      db.compare_repos([req.session.user.id, onlyPushEvents[0].repo.name]).then(compareResponse => {
        if(compareResponse[0]){
        if(compareResponse[0].repo_name != onlyPushEvents[0].repo.name){
        db.record_repo({...repoObj}).then(response => {
          console.log(response[0].repo_name)
          res.status(200).json({message: `Thanks!, your repo ${response[0].repo_name}`})
  
        }).catch(err => console.log(err))
      }else {
        res.status(200).json({message: `It looks like we already have a repo named ${onlyPushEvents[0].repo.name}`})
      }
    }else {
      db.record_repo({...repoObj}).then(response => {
        console.log(response[0].repo_name)
        res.status(200).json({message: `Thanks!, your repo ${response[0].repo_name}`})

      }).catch(err => console.log(err))
    }
      }).catch(err => console.log('err :', err))
    }
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