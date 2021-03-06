import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import Authenticator from "./components/Authenticator"
import registerServiceWorker from './registerServiceWorker';

// Courtesy of https://coderwall.com/p/i817wa/one-line-function-to-detect-mobile-devices-with-javascript...
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

ReactDOM.render((
    <BrowserRouter>
        <Authenticator isMobile={isMobileDevice()} />
    </BrowserRouter>
    ), document.getElementById('root')
);

registerServiceWorker();
