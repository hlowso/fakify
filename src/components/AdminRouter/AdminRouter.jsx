import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router";

import TopNav from "../views/TopNav/TopNav";
import SignUpViewController from '../ViewControllers/SignUpViewController/SignUpViewController';
import LoginViewController from '../ViewControllers/LoginViewController/LoginViewController';
import Authenticator from "../Authenticator/Authenticator";


class AdminRouter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            redirectDestination: ""
        };
    }

    componentDidUpdate() {
        let { redirectDestination } = this.state;
        if (redirectDestination) {
            this.setState({ redirectDestination: "" });
        }
    }

    render() {
        let { user, redirectDestination } = this.state;

        return redirectDestination
            ? (
                <Redirect to={redirectDestination} />
            )
            : (
                <div id="app-router">
                    <TopNav user={user} setUser={this.setUser} />
                    {this.renderRouter()}
                </div>
            );
    }

    renderRouter = () => (
        <main>
            <Switch>
                <Route exact path='/signup' render={() => <SignUpViewController setUser={this.setUser} redirect={this._redirect} />} />
                <Route exact path='/login' render={() => <LoginViewController setUser={this.setUser} redirect={this._redirect} />} />
                <Route path='/' render={() => <Authenticator setUser={this.setUser} redirect={this._redirect} />} />                    
            </Switch>
        </main>
    )

    setUser = userUpdate => {
        this.setState({ user: {...this.state.user, ...userUpdate} });
    }

    _redirect = tab => {
        this.setState({ redirectDestination: `/${tab}` })
    }
};

export default AdminRouter;