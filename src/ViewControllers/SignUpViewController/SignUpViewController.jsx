import React, { Component } from "react";
import { Link } from "react-router-dom";
import { 
    FormGroup, 
    ControlLabel, 
    FormControl, 
    Table
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
            <div className="form-container">
                <div className="header-container">
                    <span className="header">Sign Up</span>
                </div>
                <form> 
                    <FormGroup row controlId="email">
                        <ControlLabel>Email</ControlLabel>
                        <FormControl 
                            type="email" 
                            placeholder="example@gmail.com"
                        />
                    </FormGroup>

                    <FormGroup row controlId="password">
                        <ControlLabel>Password</ControlLabel>
                        <FormControl type="password" />
                    </FormGroup>

                    <FormGroup row controlId="confirm-password">
                        <ControlLabel>Confirm Password</ControlLabel>
                        <FormControl type="password" />
                    </FormGroup>
                </form>
                <div>
                    <Link to="/login">Already signed up?</Link>
                </div>
            </div>
        );
    }
};

export default SignUpViewController;