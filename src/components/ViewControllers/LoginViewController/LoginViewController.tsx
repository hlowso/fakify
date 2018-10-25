import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import * as Api from "../../../shared/Api";
import { LoginResponse } from "../../../shared/types";
import "./LoginViewController.css";

export interface ILoginVCProps {

}

export interface ILoginVCState {
    currentEmail?: string;
    currentPassword?: string;
    errorMessage?: string;
    accessGranted?: boolean;
}

class LoginViewController extends Component<ILoginVCProps, ILoginVCState> {
    constructor(props: ILoginVCProps) {
        super(props);
        this.state = {
            currentEmail: "",
            currentPassword: "",
            errorMessage: "",
            accessGranted: false
        };
    }

    public render() {
        let { 
            currentEmail, 
            currentPassword, 
            errorMessage, 
            accessGranted 
        } = this.state;

        return accessGranted 
                ? <Redirect to="/play" /> 
                : (
                    <div id="login-view">
                        <div className="login-container header-container">
                            <h1>Login</h1>                
                        </div>
                        <div className="login-container form-container">
                            <form onSubmit={this._handleSubmitAsync}>
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
                                                    onChange={this._handleInputChange}
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
                                                    onChange={this._handleInputChange}
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

    private _handleInputChange = (event: React.ChangeEvent<any>) => {
        let { name, value } = event.target;
        let stateUpdate: ILoginVCState = {};
        stateUpdate[name] = value;

        this.setState(stateUpdate);
    }

    private _handleSubmitAsync = async (event: React.FormEvent<any>) => {
        event.preventDefault();

        let { 
            currentEmail,
            currentPassword
         } = event.target as any;

        let email = currentEmail.value,
            password = currentPassword.value;

        if (password.length === 0) {
            return this.setState({ errorMessage: "password cannot be empty" });
        }

        let returningUser = { email, password };
        let res = await Api.loginAsync(returningUser);

        switch (res) {
            case LoginResponse.BadCredentials: 
            case LoginResponse.Error:
                return this.setState({ errorMessage: res as string });

            case LoginResponse.OK:
                return this.setState({ accessGranted: true });

            default:
                return this.setState({ errorMessage: LoginResponse.Error });
        }
    }
};

export default LoginViewController;