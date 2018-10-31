import React, { Component } from "react";
import AppRouter from "./AppRouter/AppRouter";
import * as Api from "../shared/Api";
import TopNav, { INavUser } from "./views/TopNav/TopNav";

export interface IAuthenticatorProps {
    isMobile: boolean;
}

export interface IAuthenticatorState {
    authenticating: boolean;
    user?: INavUser;
}

class Authenticator extends Component<IAuthenticatorProps, IAuthenticatorState> {
    constructor(props: IAuthenticatorProps) {
        super(props);
        this.state = {
            authenticating: true
        };
    }

    public componentDidMount() {
        this._authenticateAsync();
    }

    public render() {
        let { isMobile } = this.props;
        let { user } = this.state;

        return (
            <div id="app">
                <TopNav 
                    path={window.location.pathname}
                    isMobile={isMobile} 
                    user={user || null} />
                {this.renderRouter()}
            </div>
        )
        
    }

    public renderRouter() {
        let { authenticating } = this.state;

        return authenticating 
            ? this.renderAuthenticatingMessage()
            : <AppRouter isMobile={this.props.isMobile} user={this.state.user} />;
    }

    public renderAuthenticatingMessage = () => (
        <h1>authenticating...</h1>
    )

    private _authenticateAsync = async () => {
        let userDto = await Api.authenticateAsync();
        let stateUpdate: IAuthenticatorState = { 
            authenticating: false,
            user: !!userDto ? { email: userDto.email } : undefined 
        };
        
        this.setState(stateUpdate);
    }

};

export default Authenticator;