import React, { Component } from "react";
import { Link } from "react-router-dom";
import { 
    Form,
    FormGroup, 
    ControlLabel, 
    FormControl, 
    Col
} from "react-bootstrap";
import "./LoginViewController.css";

class LoginViewController extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentEmail: "",
            currentPassword: "",
        };
    }

    render() {
        return (
            <div className="form-container">
                <div className="header-container">
                    <span className="header">Login</span>
                </div>
                <Form horizontal> 
                    <FormGroup row controlId="email" >
                        <Col componentClass={ControlLabel} sm={2} >
                            Email
                        </Col>
                        <Col sm={10} >
                            <FormControl 
                                type="email" 
                                placeholder="example@gmail.com" 
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup row controlId="password" >
                        <Col componentClass={ControlLabel} sm={2} >
                            Password
                        </Col>
                        <Col sm={10} >
                            <FormControl type="password" />
                        </Col>
                    </FormGroup>

                </Form>
                <div>
                    <Link to="/signup">Don't have an account?</Link>
                </div>
            </div>
        );
    }
};

export default LoginViewController;