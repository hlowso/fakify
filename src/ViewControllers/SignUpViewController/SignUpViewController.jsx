import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "./SignUpViewController.css";

import * as Api from "../../shared/Api";

const PASSWORD_MINIMUM_LENGTH = 8;
const NO_MATCH_MESSAGE = "passwords don't match";
const PASSWORD_TOO_SHORT_MESSAGE = `password must be at least ${PASSWORD_MINIMUM_LENGTH} characters`

class SignUpViewController extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentEmail: "",
            currentPassword: "",
            currentConfirmPassword: "",
            errorMessage: "",
            signupSuccessful: false
        };
    }

    render() {
        let { 
            currentEmail, 
            currentPassword, 
            currentConfirmPassword,
            errorMessage,
            signupSuccessful 
        } = this.state;

        return signupSuccessful
                ? <Redirect to="/play" />
                : (
                    <div id="signup-view">
                        <div className="signup-container header-container">
                            <h1>Sign Up</h1>
                        </div>
                    
                        <div className="signup-container form-container">
            
                            <form onSubmit={this.submitHandler}>
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
                                            <td>
                                                <label>Confirm Password:</label>   
                                            </td>
                                            <td>
                                                <input
                                                    type="password"
                                                    value={currentConfirmPassword}
                                                    name="currentConfirmPassword"
                                                    placeholder="confirm password"
                                                    onChange={this.handleInputChange}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td />
                                            <td>
                                                <input
                                                    type="submit"
                                                    value="Create Account"
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                            <div>
                                                <Link to="/login">Already signed up?</Link>
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

    submitHandler = event => {
        event.preventDefault();
        let { 
            currentEmail,
            currentPassword,
            currentConfirmPassword
         } = event.target;

        let email = currentEmail.value,
            password = currentPassword.value,
            confirmPassword = currentConfirmPassword.value;

        if (password.length < PASSWORD_MINIMUM_LENGTH) {
            this.setState({ errorMessage: PASSWORD_TOO_SHORT_MESSAGE});
        }
        else if (password !== confirmPassword) {
            this.setState({ errorMessage: NO_MATCH_MESSAGE});
        }
        else {
            let newUser = { email, password };
            let stateUpdate = {};
            Api.signup(newUser)
                .then(user => {
                    if (user) {
                        stateUpdate.signupSuccessful = true;
                        this.props.setUser(user);
                    } else {
                        stateUpdate.errorMessage = "a user already exists with that email";
                    }
                    this.setState(stateUpdate);
                });
        }
    }
};

export default SignUpViewController;