import React, { Component } from "react";
import { Link } from "react-router-dom";
import { 
    Form,
    FormGroup, 
    ControlLabel, 
    FormControl, 
    Col
} from "react-bootstrap";
import "./SignUpViewController.css";

const NO_MATCH_MESSAGE = "passwords don't match";

class SignUpViewController extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentEmail: "",
            currentPassword: "",
            currentConfirmPassword: "",
            errorMessage: ""
        };
    }

    render() {

        let { 
            currentEmail, 
            currentPassword, 
            currentConfirmPassword,
            errorMessage 
        } = this.state;

        return (
            <div>
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
                                            value="Submit"
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

        if (password !== confirmPassword) {
            this.setState({ errorMessage: NO_MATCH_MESSAGE});
        }
        else {
            let newUser = { email, password };
            fetch('/api/admin/signup', { 
                body: JSON.stringify(newUser), 
                method: "POST", 
                headers: {
                    'content-type': 'application/json'
                }, 
                credentials: "same-origin" 
            })
            .then(response => {
                console.log("RESPONSE", response);
                if (response) { 
                    console.log(response.headers);
                    return response.json(); 
                }
                return null;
            })
            .then(body => {
                console.log(body);
            });
        }
    }
};

export default SignUpViewController;