import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import * as Api from "../../../shared/Api";
import { SignupResponse } from "../../../shared/types";
import { MIN_PASSWORD_LENGTH } from "../../../shared/Constants";
import "../LoginViewController/AdminViewMobile.css";
import "./SignUpViewController.css";

const NO_MATCH_MESSAGE = "passwords don't match";
const PASSWORD_TOO_SHORT_MESSAGE = `password must be at least ${MIN_PASSWORD_LENGTH} characters`;

export interface ISignUpVCProps {
    isMobile?: boolean;
}

export interface ISignUpVCState {
    currentEmail?: string;
    currentPassword?: string;
    currentConfirmPassword?: string;
    errorMessage?: string;
    signupSuccessful?: boolean;
    isSigningUp?: boolean;
}

class SignUpViewController extends Component<ISignUpVCProps, ISignUpVCState> {
    constructor(props: ISignUpVCProps) {
        super(props);
        this.state = {
            currentEmail: "",
            currentPassword: "",
            currentConfirmPassword: "",
            errorMessage: "",
            signupSuccessful: false,
            isSigningUp: false
        };
    }

    public render() {

        let { isMobile } = this.props;

        let { 
            currentEmail, 
            currentPassword, 
            currentConfirmPassword,
            errorMessage,
            signupSuccessful 
        } = this.state;

        let message = (
            <div className="message" >
                Sign up to create your own charts
            </div>
        );

        let emailLabel =  (
            <td>
                <label>Email:</label>
            </td>
        );

        let passwordLabel = (
            <td>
                <label>Password:</label>   
            </td>
        );

        let confirmPasswordLabel = (
            <td>
                <label>Confirm Password:</label>   
            </td>
        );

        let emailInput = (
            <input 
                className={isMobile ? "mobile-input" : undefined}
                type="email"
                value={currentEmail}
                name="currentEmail"
                placeholder="example@gmail.com"
                onChange={this._handleInputChange}
            />
        );

        let passwordInput = (
            <input
                className={isMobile ? "mobile-input" : undefined}
                type="password"
                value={currentPassword}
                name="currentPassword"
                placeholder="password"
                onChange={this._handleInputChange}
            />
        );

        let confirmPasswordInput = (
            <input
                className={isMobile ? "mobile-input" : undefined}
                type="password"
                value={currentConfirmPassword}
                name="currentConfirmPassword"
                placeholder="confirm password"
                onChange={this._handleInputChange}
            />
        );

        let loginLink = (
            <Link to="/login" className={ isMobile ? "mobile-link" : undefined } >Already signed up?</Link>
        );

        let errorMessageElem = (
            <span className={`error ${isMobile ? "mobile-error" : undefined}` } style={{ margin: isMobile ? 0 : 40 }} >{!!errorMessage ? errorMessage : ""}</span>
        );

        return signupSuccessful
                ? <Redirect to="/play" />
                : (
                    <div id="signup-view" className={isMobile ? "mobile-admin-view" : undefined} >
                        <div className={`signup-container header-container ${isMobile ? "mobile-header" : undefined}`}>
                            <h1>Sign Up</h1>
                        </div>
                        {message}
                        {
                            !isMobile
                                ? this.renderContentDesktop(emailLabel, emailInput, passwordLabel, passwordInput, confirmPasswordLabel, confirmPasswordInput, loginLink, errorMessageElem)
                                : this.renderContentMobile(emailInput, passwordInput, confirmPasswordInput, loginLink, errorMessageElem)
                        }
                    </div>
                );
    }

    public renderContentMobile(
        emailInput: JSX.Element, 
        passwordInput: JSX.Element,
        confirmPasswordInput: JSX.Element, 
        loginLink: JSX.Element, 
        errorElem: JSX.Element
    ) {
        let { isSigningUp } = this.state;
        let styles = { 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#666",
            width: "100%",
            maxWidth: "400px",
            height: "350px",
            borderRadius: "5px",
            margin: 0,
            marginTop: 15, 
            paddingTop: 30
        };

        return (
            isSigningUp 
                ? (
                    <div style={styles as any} >
                        {this.renderSigningUpMessage()}
                    </div>
                )
                : (
                    <div style={styles as any}>
                        {emailInput}
                        {passwordInput}
                        {confirmPasswordInput}
                        <button className="mobile-button" onClick={this._submitHandler} >sign up</button>
                        {errorElem}
                        {loginLink}
                    </div>
                )   
        );
    }

    public renderContentDesktop(
        emailLabel: JSX.Element,
        emailInput: JSX.Element,
        passwordLabel: JSX.Element,
        passwordInput: JSX.Element,
        confirmPasswordLabel: JSX.Element,
        confirmPasswordInput: JSX.Element,
        loginLink: JSX.Element,
        errorMessageElem: JSX.Element
    ) {
        return (
            <div className="signup-container form-container">
                <form onSubmit={this._submitHandler}>
                    <table style={{width: "100%"}}>
                        <col style={{width: "30%"}} />
                        <col style={{width: "70%"}} />
                        
                        <tbody>
                            <tr>
                                {emailLabel}
                                <td>
                                    {emailInput}
                                </td>
                            </tr>
                            <tr>
                                {passwordLabel}
                                <td>
                                    {passwordInput}
                                </td>
                            </tr>
                            <tr>
                                {confirmPasswordLabel}
                                <td>
                                    {confirmPasswordInput}
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
                                        {loginLink}
                                    </div>
                                </td>
                                <td>
                                    {errorMessageElem}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            </div>
        );
    }

    public renderSigningUpMessage() {
        return (
            <div style={{ color: "white", fontSize: "150%", padding: 30 }}>
                <span>signing up...</span>
            </div>
        );
    }

    private _handleInputChange = (event: React.ChangeEvent<any>) => {
        let { name, value } = event.target;
        let stateUpdate: ISignUpVCState = {};
        stateUpdate[name] = value;
        stateUpdate.errorMessage = undefined;

        this.setState(stateUpdate);
    }

    private _submitHandler = async (event: React.FormEvent<any>) => {
        event.preventDefault();

        let { 
            currentEmail,
            currentPassword,
            currentConfirmPassword
         } = this.state;

        let email = currentEmail as string,
            password = currentPassword as string,
            confirmPassword = currentConfirmPassword as string;

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
                    return window.location.replace("/play");

                default:
                    return this.setState({ errorMessage: SignupResponse.Error });
            }
        }
    }
};

export default SignUpViewController;