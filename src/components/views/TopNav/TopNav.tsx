import React, { Component } from "react";
import * as Util from "../../../shared/Util";
import { Link } from "react-router-dom";
import * as Api from "../../../shared/Api";
import { containerStyles } from "./TopNavMobileStyles";
import "./TopNav.css";

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
                <span className="nav-brand">Fakify</span>
                {this.renderTabList()}
                {this.renderUserSection()}
            </header>
        );
    }

    public renderTabList() {
        let { user } = this.props;
        let activeTab = Util.getCurrentTab();
        
        return !Util.objectIsEmpty(user) && (
            <div id="tab-list" >
                <button className={activeTab === "play" ? "active" : undefined} >
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
                <button className={activeTab === "create" ? "active" : undefined} >
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

    public renderUserSection = () => {
        let { user } = this.props;

        return user && user.email && (
            <div id="nav-user-section">
                <span className="user-email" >{user.email}</span>
                <Link
                    to="/login" 
                    id="logout-link" 
                    onClick={this._onClickLogout} 
                >
                    Log Out
                </Link>
            </div>
        );
    }

    private _onClickLogout = async (event: React.SyntheticEvent<any>) => {
        this.props.setUser();
        await Api.logoutAsync();
    }
}

export default TopNav;