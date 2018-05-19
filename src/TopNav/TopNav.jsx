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
                    <Nav>
                        {user.email 
                            &&  <NavItem 
                                    eventKey={1}
                                    onClick={this.onClickLogout} 
                                    style={{color: "white"}} 
                                >
                                        {user.email}
                                </NavItem>}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }

    onClickLogout = async event => {
        await Api.logout();
        window.location.reload();
    }
}

export default TopNav;