import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router";

import TopNav, { INavUser } from "../views/TopNav/TopNav";
import SignUpViewController from '../ViewControllers/SignUpViewController/SignUpViewController';
import LoginViewController from '../ViewControllers/LoginViewController/LoginViewController';
import Authenticator from "../Authenticator/Authenticator";
import { Tab } from "../../shared/types";

export interface IAdminRouterProps {
    isMobile: boolean;
}

export interface IAdminRouterState {
    user: INavUser | null;
    redirectDestination: Tab;
}

class AdminRouter extends Component<IAdminRouterProps, IAdminRouterState> {
    constructor(props: IAdminRouterProps) {
        super(props);
        this.state = {
            user: null,
            redirectDestination: Tab.None
        };
    }

    public componentDidUpdate() {
        let { redirectDestination } = this.state;
        if (redirectDestination) {
            this.setState({ redirectDestination: Tab.None });
        }
    }

    public render() {
        let { user, redirectDestination } = this.state;

        return redirectDestination
            ? (
                <Redirect to={`/${redirectDestination}`} />
            )
            : (
                <div id="app-router">
                    <TopNav user={user} {...this._getChildProps()} />
                    {this.renderRouter()}
                </div>
            );
    }

    public renderRouter = () => {
        let VCProps = this._getChildProps();

        return (
            <main style={{ height: window.innerHeight - 85 }} >
                <Switch>
                    <Route exact={true} path='/signup' render={() => <SignUpViewController {...VCProps} />} />
                    <Route exact={true} path='/login' render={() => <LoginViewController {...VCProps} />} />
                    <Route path='/' render={() => <Authenticator {...VCProps} />} />                    
                </Switch>
            </main>
        );
    }

    private _getChildProps = () => {
        return {
            setUser: this.setUser,
            redirect: this._redirect,
            isMobile: this.props.isMobile
        };
    }

    public setUser = (userUpdate?: INavUser) => {
        this.setState({ user: userUpdate ? {...this.state.user, ...userUpdate} : null });
    }

    private _redirect = (tab: Tab) => {
        this.setState({ redirectDestination: tab });
    }
};

export default AdminRouter;