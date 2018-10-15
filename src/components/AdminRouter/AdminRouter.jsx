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
                    <TopNav user={user} {...this.getChildProps()} />
                    {this.renderRouter()}
                </div>
            );
    }

    renderRouter = () => {
        let VCProps = this.getChildProps();

        return (
            <main>
                <Switch>
                    <Route exact path='/signup' render={() => <SignUpViewController {...VCProps} />} />
                    <Route exact path='/login' render={() => <LoginViewController {...VCProps} />} />
                    <Route path='/' render={() => <Authenticator {...VCProps} />} />                    
                </Switch>
            </main>
        );
    }

    getChildProps = () => {
        return {
            setUser: this.setUser,
            redirect: this._redirect,
            isMobile: this.props.isMobile
        };
    }

    setUser = userUpdate => {
        this.setState({ user: userUpdate ? {...this.state.user, ...userUpdate} : null });
    }

    _redirect = tab => {
        this.setState({ redirectDestination: `/${tab}` })
    }
};

export default AdminRouter;