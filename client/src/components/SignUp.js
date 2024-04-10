import React, { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/signupLogin.css';

function SignUp({ setCurrentView, setLoggedIn }) {
    const [signUpWarning, setSignUpWarning] = useState('');

    // handles sign up form submission
    function signup(event) {
        const username = document.getElementById("signup-username").value;
        const password = document.getElementById("signup-password").value;
    
        const data = { username, password };
    
        event.preventDefault(); // prevent default form refresh upon submission
    
        fetch("/backend/signup", {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {'content-type': 'application/json'}
            })
            .then(response => {
                if(!response.ok){
                    // throw new Error("Unsuccessful sign up.");
                }else{
                    return response.json();
                }
            })
            .then(data => {
                if(data.success){
                    sessionStorage.setItem('token', data.token);
                    sessionStorage.setItem('username', username);
                    setLoggedIn( { status: true, username });
                    setCurrentView( {page: 'League Standings', data: null} );
                }else if(data.error === 'Username Exists'){     // if username already exists --> return warning message and allow user to try again
                    setSignUpWarning(`Username ${data.username} already exists. Please try again.`);
                }else if(data.error === 'Invalid'){
                    setSignUpWarning('Invalid Username or Password. Please try again.');
                }else{  // DB connection failed
                    setCurrentView( {page: 'League Standings', data: null} );
                }
            })
            .catch(err => console.error(err));
        return false; // prevent default form submission behavior
    }

    return (
        <div id="page2-signup">
            <div className="container-fluid page">
                <div className="page2body">
                    <div className="left-nav"></div>
                    <div className="right-nav">
                        {/* <!-- warning --> */}
                        {signUpWarning && (
                            <div id="warning-signup" className='warning'>
                                <h3>{signUpWarning}</h3>
                            </div>
                        )}
                        

                        {/* <!-- sign up form --> */}
                        <div className="login">
                            <h3>Sign Up</h3>
                            <form method='POST' id="signup-form" onSubmit={signup}>
                                <label>Username <input type="text" name="signup-username" id="signup-username" required
                                    pattern="[A-Za-z0-9]+" title="Alphanumeric characters only" maxLength="36"/></label>
                                <label>Password <input type="password" name="signup-password" id="signup-password" required
                                    pattern="[A-Za-z0-9]+" title="Alphanumeric characters only" maxLength="36"/></label>
                                <button id='signup-btn'>SIGN UP</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }


export default SignUp;