import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { Navbar, NavbarBrand, Collapse, Nav, NavItem } from "reactstrap";
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
                    <NavbarBrand className="nav-item brand">
                        PreComp
                    </NavbarBrand>
                <Collapse>
                    <Nav >
                        {user.email 
                            &&  <NavItem 
                                    eventKey={1}
                                    onClick={this.onClickLogout} 
                                    style={{color: "white"}} 
                                >
                                        {user.email}
                                </NavItem>}
                    </Nav>
                </Collapse>
            </Navbar>
        );
    }

    onClickLogout = async event => {
        await Api.logout();
        window.location.reload();
    }
}

export default TopNav;