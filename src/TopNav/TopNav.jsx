import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { Navbar, NavItem } from "react-bootstrap";
import "./TopNav.css";

class TopNav extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logoutClicked: false
        };
    }

    render() {
        // let navStyle = {
        //     backgroundColor: "#222",
        //     width: "%100"
        // };

        let { user } = this.props;
        let { logoutClicked } = this.state; 

        return logoutClicked
            ? <Redirect to="/login" />
            : (
            <Navbar staticTop className="nav-container">
                <Navbar.Header>
                    <Navbar.Brand className="nav-item brand">
                        PreComp
                    </Navbar.Brand>
                    {user.email && <NavItem onClick={this.onClickLogout} style={{color: "white"}}>{user.email}</NavItem>}
                </Navbar.Header>
                {/* <Link to="/signup">
                    <button className="nav-item btn">
                        Sign Up                        
                    </button>
                </Link> */}
            </Navbar>
        );
    }

    onClickLogout = event => {
        fetch("/api/admin/logout", {
            method: "PATCH"
        })
        .then(response => {
            console.log("LOGOUT RESPONSE", response);
            
        });
        this.setState({ logoutClicked: true });
    }
}

export default TopNav;