import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      user: '',
      gitUser:'',
      gitRepo: '',
      message:'Please Login'
    }
  }

  componentDidMount(){
    axios.get('/api/user-data').then(user => {
      console.log(user);
      this.setState({
        user: user.data,
        gitUser: user.data.nickname
      })
    })
  }

  login = () => {
    const redirectUri = encodeURIComponent(`${window.location.origin}/callback`);
    window.location = `https://${process.env.REACT_APP_AUTH0_DOMAIN}/authorize?client_id=${process.env.REACT_APP_AUTH0_CLIENT_ID}&scope=openid%20profile%20email&redirect_uri=${redirectUri}&response_type=code`
  }

  logout = () => {
    axios.get('/api/logout').then(response => {
      this.setState({
        message: response.data,
        user:''
      })
    })
  }
  
  changeHandler = (key, value) => {
    this.setState({
      [key]: value,
      starred: 'star'
    })
  }

  star = () => {
     axios.get(`/api/${this.state.gitUser}/${this.state.gitRepo}`).then(response => {
       console.log(response.data);
     })
  }

  render() {
    console.log(this.state.gitRepo);
    return (
      <div className="App">
        <div>
          {
            this.state.user ?
            <div>
              <div className='user-image-container'>
                <img src={this.state.user.picture}/>
              </div>

              <p>{this.state.user.name}</p>

              <p>Git Username: {this.state.gitUser}</p>
              <input onChange={(e)=> this.changeHandler(e.target.name, e.target.value)} name='gitRepo' placeholder='Enter Repo name' value={this.state.gitRepo} />

              <div>
                <button onClick={this.star}>Submit</button>
                <button onClick={this.logout}>logout</button>
              </div>
            </div>
            :
            <div>
              <p>{this.state.message}</p>
              <button onClick={this.login}>login</button>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default App;
