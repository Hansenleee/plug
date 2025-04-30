import React from 'react';
import ReactDOM from 'react-dom/client';
import 'normalize.css';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { App } from './app';
import './utils/request';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <ConfigProvider locale={zhCN} theme={{ algorithm: theme.defaultAlgorithm }}>
    <App />
  </ConfigProvider>
);
