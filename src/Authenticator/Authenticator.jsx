import React, { Component } from "react";

import AppRouter from "../AppRouter/AppRouter";

import * as Api from "../shared/Api";
import * as Util from "../shared/Util";

class Authenticator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            authenticating: true
        }
    }

    componentWillMount() {
        let { setUser } = this.props;

        Api.authenticate()
            .then(user => {
                if (!user) {
                    console.log("PRECOMP - AUTHENTICATION FAILED; REDIRECTING");
                    Util.redirect("login"); 
                } else {
                    setUser(user);
                    this.setState({ authenticating: false });
                }
            });
    }

    render() {
        let { authenticating } = this.state;

        return authenticating 
            ? this.renderAuthenticatingMessage()
            : <AppRouter />;
    }

    renderAuthenticatingMessage = () => (
        <h1>authenticating...</h1>
    )
};

export default Authenticator;