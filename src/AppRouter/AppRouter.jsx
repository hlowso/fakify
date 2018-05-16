import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router";

import * as Api from "../shared/Api";
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
                : <Redirect to="/login" />;
    }

    componentWillMount() {
        let { setUser } = this.props;

        Api.authenticate()
            .then(user => { 
                let stateUpdate = { authenticating: false };
                if(user) { 
                    setUser(user);
                    stateUpdate.accessGranted = true;
                } 
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
};

export default AppRouter;