import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "./LoginViewController.css";

class LoginViewController extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentEmail: "",
            currentPassword: "",
            errorMessage: "",
            accessGranted: false
        };
    }

    render() {
        let { 
            currentEmail, 
            currentPassword, 
            errorMessage, 
            accessGranted 
        } = this.state;

        return accessGranted 
                ? <Redirect to="/play" /> 
                : (
                    <div>
                        <div className="login-container header-container">
                            <h1>Login</h1>                
                        </div>
                        <div className="login-container form-container">
                            <form onSubmit={this.handleSubmit}>
                                <table style={{width: "100%"}}>
                                    <col style={{width: "30%"}} />
                                    <col style={{width: "70%"}} />
                                    
                                    <tbody>
                                        <tr>
                                            <td>
                                                <label>Email:</label>
                                            </td>
                                            <td>
                                                <input 
                                                    type="email"
                                                    value={currentEmail}
                                                    name="currentEmail"
                                                    placeholder="example@gmail.com"
                                                    onChange={this.handleInputChange}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label>Password:</label>   
                                            </td>
                                            <td>
                                                <input
                                                    type="password"
                                                    value={currentPassword}
                                                    name="currentPassword"
                                                    placeholder="password"
                                                    onChange={this.handleInputChange}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td />
                                            <td>
                                                <input
                                                    type="submit"
                                                    value="Login"
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                            <div>
                                                <Link to="/signup">Don't have an account?</Link>
                                            </div>
                                            </td>
                                            <td>
                                                {errorMessage && <span className="error">{errorMessage}</span>}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </form>
                        </div>
                    </div>
        );
    }

    handleInputChange = event => {
        let { name, value } = event.target;
        let stateUpdate = {};
        stateUpdate[name] = value;

        this.setState(stateUpdate);
    }

    handleSubmit = event => {
        event.preventDefault();

        let { 
            currentEmail,
            currentPassword
         } = event.target;

        let email = currentEmail.value,
            password = currentPassword.value;

        if (password.length === 0) {
            this.setState({ errorMessage: "password cannot be empty" });
        }
        else {
            let returningUser = { email, password };
            fetch('/api/admin/login', { 
                body: JSON.stringify(returningUser), 
                method: "PATCH", 
                headers: {
                    'content-type': 'application/json'
                }, 
                credentials: "same-origin" 
            })
            .then(response => {
                console.log("RESPONSE", response);
                let stateUpdate = {};

                if (response.status === 200) { 
                    stateUpdate.accessGranted = true;
                }
                else {
                    stateUpdate.errorMessage = "passoword or email incorrect";
                }

                this.setState(stateUpdate);
            });
        }
    }
};

export default LoginViewController;