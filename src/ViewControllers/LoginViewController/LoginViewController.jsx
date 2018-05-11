import React, { Component } from "react";
import { Link } from "react-router-dom";
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
                <h1>Login</h1>

                <form>
                    <table style={{width: "100%"}}>
                        <col style={{width: "20%"}} />
                        <col style={{width: "80%"}} />
                        
                        <tbody>
                            <tr>
                                <td>
                                    <label>Email</label>
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
                                    <label>Password</label>   
                                </td>
                                <td>
                                    <input
                                        type="password"
                                        placeholder="password"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </form>

                {/* <Form>
                    <FormGroup row>
                        <Label for="email" sm={3}>Email</Label>
                        <Col sm={4}>
                            <Input 
                                type="email" 
                                name="email"                                
                                placeholder="Email" 
                            />
                        </Col>
                    </FormGroup>

                    <FormGroup row>
                        <Label for="password" sm={3}>Password</Label>
                        <Col sm={4}>
                            <Input 
                                type="password"
                                name="password" 
                                placeholder="Password" 
                            />
                        </Col>
                    </FormGroup>

                </Form> */}
                <div>
                    <Link to="/signup">Don't have an account?</Link>
                </div>
            </div>
        );
    }
};

export default LoginViewController;