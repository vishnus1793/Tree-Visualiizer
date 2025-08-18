import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Find the container in index.html
const container = document.getElementById('root');

// Create the React root and render the App
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
