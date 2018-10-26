import React, { Component, CSSProperties } from "react";
import { Link, Redirect } from "react-router-dom";
import * as Api from "../../../shared/Api";
import { LoginResponse } from "../../../shared/types";
import { loginViewStyle, mobileHeaderStyle, mobileInputStyle, mobileSubmitStyle, mobileSignupLinkStyle, mobileErrorStyle } from "./LoginViewMobileStyles";
import "./LoginViewController.css";

export interface ILoginVCProps {
    isMobile?: boolean;
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
            errorMessage: "foooooooo",
            accessGranted: false
        };
    }

    public render() {
        let { isMobile } = this.props;

        let { 
            currentEmail, 
            currentPassword, 
            errorMessage, 
            accessGranted 
        } = this.state;

        let emailLabel = !isMobile && (
            <td>
                <label>Email:</label>
            </td>
        );

        let passwordLabel = !isMobile && (
            <td>
                <label>Password:</label>   
            </td>
        );

        let emailInput = (
            <input 
                style={isMobile ? mobileInputStyle : undefined}
                type="email"
                value={currentEmail}
                name="currentEmail"
                placeholder="example@gmail.com"
                onChange={this._handleInputChange}
            />
        );

        let passwordInput = (
            <input
                style={isMobile ? mobileInputStyle : undefined}
                type="password"
                value={currentPassword}
                name="currentPassword"
                placeholder="password"
                onChange={this._handleInputChange}
            />
        );

        let submitInput = isMobile ? (
            <button
                style={isMobile ? mobileSubmitStyle: undefined}
                onClick={isMobile ? this._handleSubmitAsync : undefined}
            >
                Login
            </button>
        ) : (
            <input
                type={isMobile ? undefined : "submit"}
                value="Login"
            />
        );

        let signupLink = (
            <Link to="/signup" style={ isMobile ? mobileSignupLinkStyle : undefined } >Don't have an account?</Link>
        );

        let errorElem = !!errorMessage && (
            <span className="error" style={ isMobile ? mobileErrorStyle : undefined } >{errorMessage}</span>
        );

        let content = (
            isMobile 
                ? this.renderContentMobile(emailInput, passwordInput, submitInput, signupLink, errorElem)
                : this.renderContentDesktop(emailLabel, emailInput, passwordLabel, passwordInput, submitInput, signupLink, errorElem)
        );

        return accessGranted 
                ? <Redirect to="/play" /> 
                : (
                    <div id="login-view" style={isMobile ? loginViewStyle : undefined} >
                        <div className="login-container header-container" style={isMobile ? mobileHeaderStyle : undefined}>
                            <h1>Login</h1>                
                        </div>
                        {content}
                    </div>
        );
    }

    public renderContentMobile(
        emailInput: JSX.Element, 
        passwordInput: JSX.Element, 
        submitInput: JSX.Element, 
        signupLink: JSX.Element, 
        errorElem: JSX.Element | boolean
    ) {
        let styles = { 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#666",
            width: "100%",
            height: "300px",
            marginTop: 5, 
            paddingTop: 30
        } as CSSProperties;

        return (
            <div style={styles}>
                {emailInput}
                {passwordInput}
                <div style={{ width: "80%", display: "flex", justifyContent: "space-between" }}>
                    {submitInput}
                    <div style={{ width: "50%", display: "flex", paddingLeft: 30 }} >
                        {errorElem}
                    </div>
                </div>
                {signupLink}
            </div>
        );
    }

    public renderContentDesktop(
        emailLabel: JSX.Element | boolean, 
        emailInput: JSX.Element, 
        passwordLabel: JSX.Element | boolean, 
        passwordInput: JSX.Element, 
        submitInput: JSX.Element, 
        signupLink: JSX.Element, 
        errorElem: JSX.Element | boolean
    ) {
        return (
            <div className="login-container form-container">
                <form onSubmit={this._handleSubmitAsync}>
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
                                <td />
                                <td>
                                    {submitInput} 
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div>
                                        {signupLink}
                                    </div>
                                </td>
                                <td>
                                    {errorElem}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            </div>
        );
    }

    private _handleInputChange = (event: React.ChangeEvent<any>) => {
        let { name, value } = event.target;
        let stateUpdate: ILoginVCState = {};
        stateUpdate[name] = value;
        stateUpdate.errorMessage = undefined;

        this.setState(stateUpdate);
    }

    private _handleSubmitAsync = async (event?: React.FormEvent<any>, ) => {
        if (event) event.preventDefault();

        let { 
            currentEmail,
            currentPassword
         } = this.state;

        let email = currentEmail as string,
            password = currentPassword as string;

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