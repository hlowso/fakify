import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import * as Api from "../../../shared/Api";
import { SignupResponse } from "../../../shared/types";
import { MIN_PASSWORD_LENGTH } from "../../../shared/Constants";
import "./SignUpViewController.css";

const NO_MATCH_MESSAGE = "passwords don't match";
const PASSWORD_TOO_SHORT_MESSAGE = `password must be at least ${MIN_PASSWORD_LENGTH} characters`;

export interface ISignUpVCProps {

}

export interface ISignUpVCState {
    currentEmail?: string;
    currentPassword?: string;
    currentConfirmPassword?: string;
    errorMessage?: string;
    signupSuccessful?: boolean;
}

class SignUpViewController extends Component<ISignUpVCProps, ISignUpVCState> {
    constructor(props: ISignUpVCProps) {
        super(props);
        this.state = {
            currentEmail: "",
            currentPassword: "",
            currentConfirmPassword: "",
            errorMessage: "",
            signupSuccessful: false
        };
    }

    public render() {
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
            
                            <form onSubmit={this._submitHandler}>
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
                                            <td>
                                                <label>Confirm Password:</label>   
                                            </td>
                                            <td>
                                                <input
                                                    type="password"
                                                    value={currentConfirmPassword}
                                                    name="currentConfirmPassword"
                                                    placeholder="confirm password"
                                                    onChange={this._handleInputChange}
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

    private _handleInputChange = (event: React.ChangeEvent<any>) => {
        let { name, value } = event.target;
        let stateUpdate: ISignUpVCState = {};
        stateUpdate[name] = value;

        this.setState(stateUpdate);
    }

    private _submitHandler = async (event: React.FormEvent<any>) => {
        event.preventDefault();

        let { 
            currentEmail,
            currentPassword,
            currentConfirmPassword
         } = event.target as any;

        let email = currentEmail.value,
            password = currentPassword.value,
            confirmPassword = currentConfirmPassword.value;

        if (password.length < MIN_PASSWORD_LENGTH) {
            this.setState({ errorMessage: PASSWORD_TOO_SHORT_MESSAGE});
        } else if (password !== confirmPassword) {
            this.setState({ errorMessage: NO_MATCH_MESSAGE});
        } else {
            let newUser = { email, password };
            let res = await Api.signupAsync(newUser);

            switch(res) {
                case SignupResponse.EmailTaken:
                case SignupResponse.InvalidCredentials:
                case SignupResponse.Error:
                    return this.setState({ errorMessage: res });

                case SignupResponse.OK: 
                    return this.setState({ signupSuccessful: true });

                default:
                    return this.setState({ errorMessage: SignupResponse.Error });
            }
        }
    }
};

export default SignUpViewController;