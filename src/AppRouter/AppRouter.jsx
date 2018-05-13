import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router";

import PlayerViewController from "../ViewControllers/PlayerViewController/PlayerViewController";

class AppRouter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authenticating: true,
            accessGranted: false
        }
    }

    render() {
        let { authenticating, accessGranted } = this.state;

        return authenticating 
            ? this.getAuthenticatingJSX()
            : accessGranted
                ? this.getRouterJSX()
                : this.getRedirectJSX();
    }

    componentWillMount() {
        fetch('/api/admin/authenticate', { 
            method: "GET", 
            credentials: "same-origin" 
        })
        .then(response => {
            let stateUpdate = { authenticating: false };
            stateUpdate.accessGranted = response.status === 200;
            this.setState(stateUpdate);
        });
    }

    getAuthenticatingJSX = () => (
        <h1>authenticating...</h1>
    )

    getRouterJSX = () => (
        <Switch id="app-router">
            <Route exact path="/play" component={PlayerViewController} />
        </Switch>
    )

    getRedirectJSX = () => (
        <Redirect to="/login" />
    )
};

export default AppRouter;