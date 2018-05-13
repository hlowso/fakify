import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import AdminRouter from './AdminRouter/AdminRouter';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render((
    <BrowserRouter>
        <AdminRouter />
    </BrowserRouter>
    ), document.getElementById('root')
);

registerServiceWorker();
