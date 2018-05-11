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

class SignUpViewController extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentEmail: "",
            currentPassword: "",
            currentConfirmedPassword: ""
        };
    }

    render() {
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
                                            placeholder="example@gmail.com"
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
                                            placeholder="password"
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
                                            placeholder="password"
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
                            </tbody>
                        </table>
                    </form>
                    <div>
                        <Link to="/login">Already signed up?</Link>
                    </div>
                </div>
            </div>
        );
    }

    submitHandler = event => {
        event.preventDefault();
        fetch('/api/users', { body: JSON.stringify({message: "hello"}), method: "POST", headers: {'content-type': 'application/json'} })
            .then(response => {
                return response.json();
            })
            .then(body => {
                console.log(body);
            });
    }
};

export default SignUpViewController;