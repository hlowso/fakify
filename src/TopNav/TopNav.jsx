import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "react-bootstrap";
import "./TopNav.css";

class TopNav extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        // let navStyle = {
        //     backgroundColor: "#222",
        //     width: "%100"
        // };

        return (
            <Navbar staticTop className="nav-container">
                <Navbar.Header>
                    <Navbar.Brand className="nav-item brand">
                        PreComp
                    </Navbar.Brand>
                </Navbar.Header>
                {/* <Link to="/signup">
                    <button className="nav-item btn">
                        Sign Up                        
                    </button>
                </Link> */}
            </Navbar>
        );
    }
}

export default TopNav;