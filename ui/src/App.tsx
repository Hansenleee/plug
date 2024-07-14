import React from 'react';
import { Layout, Menu, Image, Typography } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { router } from './route';
import './style.scss';

const { Header, Content } = Layout;
const ITEMS = [
  {
    label: '系统配置',
    key: 'config',
  },
  {
    label: 'mock 设置',
    key: 'mock',
  },
];

export const App: React.FC = () => {
  return (
    <Layout className="app-container">
      <Header style={{ display: 'flex', alignItems: 'center', background: '#fff' }}>
        <div className="header-logo">
          <Image
            height={32}
            src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
          />
          <Typography.Text className="header-title">Plug Proxy</Typography.Text>
        </div>
        <Menu
          mode="horizontal"
          items={ITEMS}
          style={{ flex: 1, minWidth: 0, flexDirection: 'row-reverse', border: 0 }}
        />
      </Header>
      <Content>
        <div className="content-body">
          <RouterProvider router={router} />
        </div>
      </Content>
    </Layout>
  );
};
