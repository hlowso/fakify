import React from "react";
import { Switch, Route } from "react-router";

import TopNav from "../TopNav/TopNav";
import AppRouter from "../AppRouter/AppRouter";
import SignUpViewController from '../ViewControllers/SignUpViewController/SignUpViewController';
import LoginViewController from '../ViewControllers/LoginViewController/LoginViewController';

const AdminRouter = () => {
    return (
        <div id="app-router">
            <TopNav />
            <main>
                <Switch>
                    <Route exact path='/signup' component={SignUpViewController} />
                    <Route exact path='/login' component={LoginViewController} />
                    <Route path='/' component={AppRouter} />                    
                </Switch>
            </main>
        </div>
    );
};

export default AdminRouter;