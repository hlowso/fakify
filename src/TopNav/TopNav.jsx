import React, { Component } from "react";

import "./TopNav.css";

import * as Api from "../shared/Api"; 

class TopNav extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <header className="nav-container">
                <span className="nav nav-brand">PreComp</span>
                {this.renderNavList()}
            </header>
        );
    }

    renderNavList = () => {
        let { user } = this.props;
        return user.email && (
            <div className="nav nav-list">
                <a 
                    className="nav-item" 
                    id="logout-link" 
                    onClick={this.onClickLogout} >Log Out</a>
                <span className="nav-item">{user.email}</span>
            </div>
        );
    }

    onClickLogout = async event => {
        await Api.logout();
        window.location.reload();
    }
}

export default TopNav;