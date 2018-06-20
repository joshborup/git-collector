import React, { Component } from 'react';
import StudentPage from './components/StudentPage';

class App extends Component {
<<<<<<< HEAD
  constructor(props){
    super(props)
    this.state = {
      user: '',
      starred: 'star',
      gitRepo:'node-auth-afternoon',
      gitUser:'',
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
    alert('set up your login function here')
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
    if(this.state.starred === 'star'){
      this.setState({
        starred: 'unstar'
      })
      return axios.get(`/api/star?gitUser=${this.state.gitUser}&gitRepo=${this.state.gitRepo}`)
    }else {
      this.setState({
        starred: 'star'
      })
      return axios.get(`/api/unstar?gitUser=${this.state.gitUser}&gitRepo=${this.state.gitRepo}`)
    }
  }
=======
>>>>>>> solution

  
  render() {
    return (
      <div className="App">
        <StudentPage />
      </div>
    );
  }
}

export default App;
