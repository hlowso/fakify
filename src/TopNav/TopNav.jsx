import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { Navbar, Nav, NavItem } from "react-bootstrap";
import "./TopNav.css";

import * as Api from "../shared/Api"; 

class TopNav extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        let { user } = this.props;

        return (
            <Navbar staticTop className="nav-container">
                <Navbar.Header>
                    <Navbar.Brand className="nav-item brand">
                        PreComp
                    </Navbar.Brand>
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav pullRight>
                        {user.email 
                            && <NavItem 
                                    onClick={this.onClickLogout} 
                                    style={{color: "white"}} >
                                        {user.email}
                                </NavItem>}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }

    onClickLogout = event => {
        Api.logout()
            .then(() => { 
                window.location.reload();
            });
    }
}

export default TopNav;