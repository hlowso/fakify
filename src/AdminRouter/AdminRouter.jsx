import React, { Component } from "react";
import { Switch, Route } from "react-router";

import TopNav from "../TopNav/TopNav";
import SignUpViewController from '../ViewControllers/SignUpViewController/SignUpViewController';
import LoginViewController from '../ViewControllers/LoginViewController/LoginViewController';
import Authenticator from "../Authenticator/Authenticator";


class AdminRouter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {}
        }
    }

    render() {
        let { user } = this.state;

        return (
            <div id="app-router">
                <TopNav user={user} setUser={this.setUser} />
                {this.renderRouter()}
            </div>
        );
    }

    renderRouter = () => (
        <main>
            <Switch>
                <Route exact path='/signup' render={() => <SignUpViewController setUser={this.setUser} />} />
                <Route exact path='/login' render={() => <LoginViewController setUser={this.setUser} />} />
                <Route path='/' render={() => <Authenticator setUser={this.setUser} />} />                    
            </Switch>
        </main>
    )

    setUser = userUpdate => {
        this.setState({ user: {...this.state.user, ...userUpdate} });
    }
};

export default AdminRouter;