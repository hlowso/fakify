import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router";

import * as Api from "../shared/Api";
import * as Util from "../shared/Util";

import PlayerViewController from "../ViewControllers/PlayerViewController/PlayerViewController";
import SignUpViewController from "../ViewControllers/SignUpViewController/SignUpViewController";
import LoginViewController from "../ViewControllers/LoginViewController/LoginViewController";

class AppRouter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authenticating: true
        }
    }

    render() {
        let { authenticating, accessGranted } = this.state;
        let { route } = this.props;

        return authenticating 
            ? this.renderAuthenticatingMessage()
            : (
                <Switch id="app-router">
                    <Route exact path="/play" component={PlayerViewController} />
                </Switch>
            );
    }

    componentWillMount() {
        let { 
            setUser,
            redirect 
        } = this.props;

        Api.authenticate()
            .then(user => {
                if (!user) {
                    console.log("PRECOMP - REDIRECTING");
                    Util.redirect("login"); 
                } else {
                    setUser(user);
                    this.setState({ authenticating: false });
                }
            });
    }

    renderAuthenticatingMessage = () => (
        <h1>authenticating...</h1>
    )
};

export default AppRouter;