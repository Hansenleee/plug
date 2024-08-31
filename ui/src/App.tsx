import React from 'react';
import { Layout, Menu, Image, Typography, Space } from 'antd';
import { SettingOutlined, ApiOutlined } from '@ant-design/icons';
import { RouterProvider } from 'react-router-dom';
import { router } from './route';
import './style.scss';

const { Header, Content } = Layout;
const ITEMS = [
  {
    label: '系统配置',
    key: 'config',
    icon: <SettingOutlined />,
  },
  {
    label: 'mock 设置',
    key: 'mock',
    icon: <ApiOutlined />,
    children: [
      {
        label: (
          <a href="/management/mock/base" target="_blank" rel="noopener noreferrer">
            基础配置
          </a>
        ),
        key: 'mockSetting',
      },
      {
        label: (
          <a href="/management/mock/yapi" target="_blank" rel="noopener noreferrer">
            yapi
          </a>
        ),
        key: 'yapiSetting',
      },
    ],
  },
];

export const App: React.FC = () => {
  return (
    <Layout className="app-container">
      <Header style={{ display: 'flex', alignItems: 'center', background: '#fff' }}>
        <Space.Compact className="header-logo" onClick={() => window.location.replace('/management')}>
          <Image
            height={58}
            preview={false}
            style={{ display: 'block' }}
            src="https://leebucket01.oss-cn-shanghai.aliyuncs.com/Statics/images/plug-logo-opacity.png"
          />
          <Typography.Text className="header-title">Plug Proxy</Typography.Text>
        </Space.Compact>
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
