import React, { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/signupLogin.css';

function Login({ setCurrentView, setLoggedIn }) {
    const [loginWarning, setLoginWarning] = useState('');

    // handles login form submission
    function login(event) {
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        const data = { username, password };

        event.preventDefault(); // prevent default form refresh upon submission

        fetch("/backend/login", {
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
                }else if(data.error === 'Incorrect'){     // incorrect login details (or invalid characters) --> prompt user to try again
                    setLoginWarning('The username or password you entered is incorrect. Please try again.');
                }else if(data.error === 'Invalid'){
                    setLoginWarning('Invalid Username or Password. Please try again.');
                }else{  // DB connection failed
                    setCurrentView( {page: 'League Standings', data: null} );
                }
            })
            .catch(err => console.error(err));
        return false; // prevent default form submission behavior
    }

    return (
        <div id="page3-login">
            <div className="container-fluid page">
                <div className="page2body">
                    <div className="left-nav"></div>
                    <div className="right-nav">
                        {/* <!-- warning --> */}
                        {loginWarning && (
                            <div id="warning-login" className='warning'>
                                <h3>{loginWarning}</h3>
                            </div>
                        )}
                        

                        {/* <!-- sign up form --> */}
                        <div className="login">
                            <h3>Login</h3>
                            <form method='POST' id="login-form" onSubmit={login}>
                                <label>Username <input type="text" name="login-username" id="login-username" required
                                    pattern="[A-Za-z0-9]+" title="Alphanumeric characters only" maxLength="36"/></label>
                                <label>Password <input type="password" name="login-password" id="login-password" required
                                    pattern="[A-Za-z0-9]+" title="Alphanumeric characters only" maxLength="36"/></label>
                                <button id='login-btn'>LOG IN</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }


export default Login;