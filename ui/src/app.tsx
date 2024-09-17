import React, { useMemo, useState } from 'react';
import { Layout, Menu, Image, Typography, Space } from 'antd';
import { SettingOutlined, ApiOutlined, DashboardOutlined } from '@ant-design/icons';
import { RouterProvider } from 'react-router-dom';
import { router } from './route';
import { System } from './pages/system';
import './style.scss';

const { Header, Content } = Layout;

export const App: React.FC = () => {
  const [systemOpen, setSystemOpen] = useState(false);
  const items = useMemo(() => [
    {
      label: '系统配置',
      key: 'config',
      path: `${router.basename}/system`,
      icon: <SettingOutlined />,
      onClick: () => setSystemOpen(true),
    },
    {
      label: 'Mock 设置',
      key: 'mock',
      icon: <ApiOutlined />,
      path: `${router.basename}/mock`,
      onClick: () => router.navigate('/mock')
    },
    {
      label: '监控',
      key: 'dashborard',
      icon: <DashboardOutlined />,
      path: router.basename,
      onClick: () => router.navigate('/')
    },
  ], []);
  const defaultItem = items.find((_) => window.location.pathname.endsWith(_.path as string));

  return (
    <Layout className="app-container">
      <Header style={{ display: 'flex', alignItems: 'center', background: '#fff' }}>
        <Space.Compact className="header-logo" onClick={() => router.navigate('/')}>
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
          items={items}
          defaultSelectedKeys={defaultItem?.key ? [defaultItem.key] : undefined}
          style={{ flex: 1, minWidth: 0, flexDirection: 'row-reverse', border: 0 }}
        />
      </Header>
      <Content>
        <div className="content-body">
          <RouterProvider router={router} />
        </div>
      </Content>
      <System open={systemOpen} onClose={() => setSystemOpen(false)} />
    </Layout>
  );
};
