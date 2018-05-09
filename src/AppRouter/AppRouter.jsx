import React from "react";
import { Switch, Route } from "react-router";

import TopNav from "../TopNav/TopNav";
import SignUpViewController from '../ViewControllers/SignUpViewController/SignUpViewController';
// import LoginViewController from '../ViewControllers/LoginViewController';

const AppRouter = () => (
    <div id="app-router">
        <TopNav />
        <main>
            <Switch>
                <Route exact path='/signup' component={SignUpViewController} />
                {/* <Route exact path='/login' component={LoginViewController} /> */}
            </Switch>
        </main>
    </div>
);

export default AppRouter;