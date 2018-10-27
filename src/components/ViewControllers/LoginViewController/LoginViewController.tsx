import React, { Component, CSSProperties } from "react";
import { Link, Redirect } from "react-router-dom";
import * as Api from "../../../shared/Api";
import { LoginResponse } from "../../../shared/types";
import "./AdminViewMobile.css";
import "./LoginViewController.css";

export interface ILoginVCProps {
    isMobile?: boolean;
}

export interface ILoginVCState {
    currentEmail?: string;
    currentPassword?: string;
    errorMessage?: string;
    accessGranted?: boolean;
    isLoggingIn?: boolean;
}

class LoginViewController extends Component<ILoginVCProps, ILoginVCState> {
    constructor(props: ILoginVCProps) {
        super(props);
        this.state = {
            currentEmail: "",
            currentPassword: "",
            errorMessage: "",
            accessGranted: false,
            isLoggingIn: false
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

        let submitInput = isMobile ? (
            <button
                className={"mobile-button"}
                onClick={this._handleSubmitAsync}
            >
                Login
            </button>
        ) : (
            <input
                type="submit"
                value="Login"
            />
        );

        let signupLink = (
            <Link to="/signup" className={ isMobile ? "mobile-link" : undefined } >Don't have an account?</Link>
        );

        let errorElem = (
            <div className={`error ${isMobile ? "mobile-error" : undefined}` } style={{ margin: isMobile ? 0 : 40 }} >{!!errorMessage ? errorMessage : ""}</div>
        );

        let content = (
            isMobile 
                ? this.renderContentMobile(emailInput, passwordInput, submitInput, signupLink, errorElem)
                : this.renderContentDesktop(emailLabel, emailInput, passwordLabel, passwordInput, submitInput, signupLink, errorElem)
        );

        return accessGranted 
                ? <Redirect to="/play" /> 
                : (
                    <div id="login-view" className={isMobile ? "mobile-admin-view" : undefined} >
                        <div className={ `login-container header-container ${isMobile ? "mobile-header" : undefined}` }>
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
        let { isLoggingIn } = this.state;
        let styles = { 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#666",
            width: "100%",
            height: "300px",
            marginTop: 15, 
            paddingTop: 30
        } as CSSProperties;

        return (
            isLoggingIn 
                ? (
                    <div style={styles} >
                        {this.renderLoggingInMessage()}
                    </div>
                )
                : (
                    <div style={styles}>
                        {emailInput}
                        {passwordInput}
                        {submitInput}
                        {errorElem}
                        {signupLink}
                    </div>
                )   
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
        let { isLoggingIn } = this.state;

        return (
            <div className="login-container form-container">
            {
                isLoggingIn
                    ? this.renderLoggingInMessage()
                    : (
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
                    )
            }
            </div>
        );
    }

    public renderLoggingInMessage() {
        return (
            <div style={{ color: "white", fontSize: "150%", padding: 30 }}>
                <span>logging in...</span>
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
        this.setState({ isLoggingIn: true });
        let res = await Api.loginAsync(returningUser);

        switch (res) {
            case LoginResponse.BadCredentials: 
            case LoginResponse.Error:
                return this.setState({ errorMessage: res as string, isLoggingIn: false });

            case LoginResponse.OK:
                return this.setState({ accessGranted: true, isLoggingIn: false });

            default:
                return this.setState({ errorMessage: LoginResponse.Error, isLoggingIn: false });
        }
    }
};

export default LoginViewController;