import { Buffer } from 'buffer';
import React from 'react'

// Polyfill Buffer for isomorphic-git
window.Buffer = window.Buffer || Buffer;
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
