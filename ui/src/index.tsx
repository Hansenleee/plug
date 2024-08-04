import React from 'react';
import ReactDOM from 'react-dom/client';
import 'normalize.css';
import { App } from './app';
import './utils/request';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(<App />);
