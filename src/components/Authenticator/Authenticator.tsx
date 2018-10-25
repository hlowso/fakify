import React, { Component } from "react";
import AppRouter from "../AppRouter/AppRouter";
import * as Api from "../../shared/Api";
import { IUser, Tab } from "../../shared/types";

export interface IAuthenticatorProps {
    setUser: (user: IUser) => void;
    redirect: (tab: Tab) => void;
}

export interface IAuthenticatorState {
    authenticating: boolean;
}

class Authenticator extends Component<IAuthenticatorProps, IAuthenticatorState> {
    constructor(props: IAuthenticatorProps) {
        super(props);
        this.state = {
            authenticating: true
        }
    }

    public componentWillMount() {
        this._authenticateAsync();
    }

    public render() {
        let { authenticating } = this.state;

        return authenticating 
            ? this.renderAuthenticatingMessage()
            : <AppRouter />;
    }

    public renderAuthenticatingMessage = () => (
        <h1>authenticating...</h1>
    )

    private _authenticateAsync = async () => {
        let { setUser, redirect } = this.props;

        let user = await Api.authenticateAsync();
        if (!user) {
            console.log("PRECOMP - AUTHENTICATION FAILED; REDIRECTING");
            redirect(Tab.Login); 
        } else {
            setUser(user);
            this.setState({ authenticating: false });
        }
    }

};

export default Authenticator;