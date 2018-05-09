import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "PreComp (title from frontend)",
      message: "a message from frontend"
    }
  }

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ title: res }))
      .catch(err => console.log(err));
    this.getUser()
      .then(res => this.setState({ message: res }))
      .catch(err => console.log(err));      
  }

  callApi = async () => {
    const response = await fetch('/api/users');
    const body = await response.json();
    return body;
  }

  getUser = async () => {
    const response = await fetch('api/users/1');
    return await response.json();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">{this.state.title}</h1>
        </header>
        <p className="App-intro">
          {this.state.message}
        </p>
      </div>
    );
  }
}

export default App;
