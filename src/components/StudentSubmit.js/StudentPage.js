import React, { Component } from 'react';
import axios from 'axios';
import Submissions from './Submissions';
import './student.css';

class StudentPage extends Component {
  constructor(props){
    super(props)
    this.state = {
      user: '',
      gitUser:'',
      gitRepo: '',
      message:'',
      comments:'',
      cohort:''
    }
  }

  componentDidMount(){
    axios.get('/api/user-data').then(user => {
      console.log(user);
      this.setState({
        user: user.data,
        gitUser: user.data.git_hub_name
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
      [key]: value
    })
  }

  submit = () => {
     axios.post(`/api/${this.state.gitUser}/${this.state.gitRepo}`, {cohort: this.state.cohort, comments: this.state.comments}).then(response => {
       console.log(response.data);
          this.setState({
            message: response.data.message,
            cohort: '',
            comments:'',
            repoInfo: '',
            comments:'',
            cohort:'',
            gitRepo: ''
         })
     })
  }
  
  render() {
    let { user, gitUser, gitRepo, repoInfo, cohort, comments, message } = this.state
    let { submit, logout, changeHandler, login } = this;
    let studentSubmissions = { user, gitUser , gitRepo , repoInfo, cohort, comments, message }
    let studentDispatchers = {submit, logout, changeHandler, login}

    console.log('this.state :', this.state);
    return (
      <div className="submission-page-container">
        <div>
          {
            user ?
            <div className='logged-in-student-submissions'>
              <Submissions {...studentDispatchers} {...studentSubmissions}/>
              <div> sup </div>
            </div>
            :
            <div className='login'>
              <p>{this.state.message}</p>
              <button onClick={this.login}>login</button>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default StudentPage;
