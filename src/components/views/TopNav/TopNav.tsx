import React, { Component } from "react";
import * as Util from "../../../shared/Util";
import { Link } from "react-router-dom";
import Cx from "classnames";
// import { Button, ButtonGroup } from "react-bootstrap";
import * as Api from "../../../shared/Api";
import { containerStyles } from "./TopNavMobileStyles";
import "./TopNav.css";
import "./TopNavMobile.css";

export interface INavUser {
    email: string;
}

export interface ITopNavProps {
    user: INavUser | null;
    setUser: (user?: INavUser) => void;
    redirect: (tab: string) => void;
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
        let { user, isMobile } = this.props;
        return (!isMobile || !user) && (
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

        return !Util.objectIsEmpty(user) && (
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
                    <Link to="/create" style={{
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
        let { user, isMobile } = this.props;

        return !!user && (
            <div id="nav-user-section" className={isMobile ? "mobile" : undefined}>
                {this.renderEmail()}
                <Link
                    to="/login" 
                    id="logout-link" 
                    onClick={this._onClickLogout} 
                >
                    <span style={{ float: "right" }}>Log Out</span>
                </Link>
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
        this.props.setUser();
        await Api.logoutAsync();
    }
}

export default TopNav;