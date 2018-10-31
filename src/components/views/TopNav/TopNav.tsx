import React, { Component } from "react";
import * as Util from "../../../shared/Util";
import { Link } from "react-router-dom";
import Cx from "classnames";
import * as Api from "../../../shared/Api";
import { containerStyles } from "./TopNavMobileStyles";
import "./TopNav.css";
import "./TopNavMobile.css";

export interface INavUser {
    email: string;
}

export interface ITopNavProps {
    path: string;
    user: INavUser | null;
    isMobile: boolean;
}

class TopNav extends Component<ITopNavProps, {}> {
    constructor(props: ITopNavProps) {
        super(props);
        this.state = {
            
        };
    }

    public render() {
        let { isMobile } = this.props;
        return (
            <header className="nav-container" style={ isMobile ? containerStyles : undefined } >
                {this.renderBrand()}
                {this.renderTabList()}
                {this.renderUserSection()}
            </header>
        );
    }

    public renderBrand() {
        let { isMobile } = this.props;
        return !isMobile && (
            <span className="nav-brand">Fakify</span>
        );
    }

    public renderTabList() {
        let { user, isMobile } = this.props;
        let activeTab = Util.getCurrentTab();

        let playClasses = Cx({
            "play-link-button": true,
            "active": activeTab === "play"
        });

        let createClasses = Cx({
            "create-link-button": true,
            "active": activeTab === "create"
        });

        return (
            <div id="tab-list" className={isMobile ? "mobile" : undefined} >
                <button className={playClasses} >
                    <Link to="/play" style={{
                        display: "block",
                        height: '100%',
                        width: '100%',
                        color: activeTab === "play" ? '#222' : '#ddd',
                        textAlign: "center",
                        lineHeight: "50px",
                        textDecoration: "none"
                    }} >
                        Play
                    </Link>
                </button>
                <button className={createClasses} >
                    <Link to={!!user ? "/create" : "/login"} style={{
                        display: "block",
                        height: '100%',
                        width: '100%',
                        color: activeTab === "create" ? '#222' : '#ddd',
                        textAlign: "center",
                        lineHeight: "50px",
                        textDecoration: "none"
                    }} >
                        Create
                    </Link>
                </button>
            </div>
        );
    }

    public renderUserSection() {
        let { user, isMobile, path } = this.props;

        if (path === "/login" || path === "/signup") {
            return;
        }

        let content = !!user ? (
            <a
                id="logout-link" 
                onClick={this._onClickLogout} 
            >
                <span style={{ float: "right" }}>Log Out</span>
            </a>
        ) : (
            <div style={{ color: "white" }}>
                <Link to="/login" >
                    <span style={{ fontSize: "130%" }}>Log In</span>
                </Link>
                &#47;
                <Link to="/signup" >
                    <span style={{ fontSize: "130%" }}>Sign Up</span>
                </Link>
            </div>
        );

        return (
            <div id="nav-user-section" className={isMobile ? "mobile" : undefined}>
                {this.renderEmail()}
                {content}
            </div>
        );
    }

    public renderEmail() {
        let { user, isMobile } = this.props;

        let emailClasses = Cx({
            "user-email": true,
            "mobile": isMobile
        });

        return user && (
            <div className={emailClasses} >
                <span style={{ float: "right" }}>{user.email}</span>
            </div>
        );
    }

    private _onClickLogout = async (event: React.SyntheticEvent<any>) => {
        await Api.logoutAsync();
        window.location.reload();
    }
}

export default TopNav;