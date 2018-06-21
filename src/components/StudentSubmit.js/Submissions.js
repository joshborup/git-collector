import React from 'react';

const Submissions = (props) => {
    return (
        <div>
              <div className='user-image-container'>
                <img src={props.user.picture}/>
              </div>

              <p>{props.user.name}</p>

              <p>Git Username: {props.gitUser}</p>
              <input onChange={(e)=> props.changeHandler(e.target.name, e.target.value)} name='gitRepo' placeholder='Enter Repo name' value={props.gitRepo} />
              <input onChange={(e)=> props.changeHandler(e.target.name, e.target.value)} name='cohort' placeholder='Enter Cohort (i.e. WPX6)' value={props.cohort} />
              <textarea onChange={(e)=> props.changeHandler(e.target.name, e.target.value)} name='comments' placeholder='Enter commments for mentors' value={props.comments} />
              <div>
                <button onClick={props.submit}>Submit</button>
                <button onClick={props.logout}>logout</button>
              </div>
              <pre>
                {props.message}
              </pre>
        </div>
    );
};

export default Submissions;