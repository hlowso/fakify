import React, { Component } from "react";
import * as Util from "../../../shared/Util";
import { Link } from "react-router-dom";
import * as Api from "../../../shared/Api"; 
import "./TopNav.css";

class TopNav extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    render() {
        return (
            <header className="nav-container">
                <span className="nav-brand">Fakify</span>
                {this.renderTabList()}
                {this.renderUserSection()}
            </header>
        );
    }

    renderTabList() {
        let { user } = this.props;
        let activeTab = Util.getCurrentTab();
        
        return !Util.objectIsEmpty(user) && (
            <div id="tab-list" >
                <Link
                    to="/play"
                    id="play-link" >
                    <button className={activeTab === "play" ? "active" : undefined}>
                        Play
                    </button>
                </Link>
                <Link
                    to="/create"
                    id="create-link" >
                    <button className={activeTab === "create" ? "active" : undefined}>
                        Create
                    </button>
                </Link>
            </div>
        );
    }

    renderUserSection = () => {
        let { user } = this.props;

        return user && user.email && (
            <div id="nav-user-section">
                <span className="user-email" >{user.email}</span>
                <Link
                    to="/login" 
                    id="logout-link" 
                    onClick={this.onClickLogout} 
                >
                    Log Out
                </Link>
            </div>
        );
    }

    onClickLogout = async event => {
        this.props.setUser({ email: null })
        await Api.logout();
    }
}

export default TopNav;