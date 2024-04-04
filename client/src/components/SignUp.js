import React, { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/SignUp.css';
// Bootstrap Components -------------------------------------------------------
import Container from 'react-bootstrap/Container';
// ----------------------------------------------------------------------------

function SignUp({ setCurrentView }) {
    const [signUpWarning, setSignUpWarning] = useState('');

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
                console.log(data);
                if(data.success){
                    // set current view back to league standings
                    console.log('success');
                    setCurrentView('League Standings');
                }else if(data.error === 'Username Exists'){     // if username already exists --> return warning message and allow user to try again
                    setSignUpWarning(`Username ${data.attemptedUsername} already exists. Please try again.`);
                }else if(data.error === 'Invalid'){
                    setSignUpWarning('Invalid Username or Password. Please try again.');
                }else{      // query prep failed or DB connection failed --> start over
                    setCurrentView('League Standings');
                }
            })
            .catch(err => console.error(err));
        return false; // prevent default form submission behavior
    }

    return (
        <div id="page3-signup">
            <div className="container-fluid page">
                <div className="page2body">
                    <div className="left-nav"></div>
                    <div className="right-nav">
                        {/* <!-- warning --> */}
                        {signUpWarning && (
                            <div id="warning-signup">
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