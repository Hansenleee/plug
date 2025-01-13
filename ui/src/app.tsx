import React, { useMemo, useState } from 'react';
import { Layout, Menu, Image, Typography, Space } from 'antd';
import { SettingOutlined, ApiOutlined, DashboardOutlined } from '@ant-design/icons';
import { RouterProvider } from 'react-router-dom';
import { router } from './route';
import { System } from './pages/system/config';
import { Certificate } from './pages/system/certificate';
import './style.scss';
import { useMount } from 'ahooks';

const { Header, Content } = Layout;

export const App: React.FC = () => {
  const [activeMenuKeys, setActiveMenuKeys] = useState<string[]>([]);
  const [systemOpen, setSystemOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);

  const items = useMemo(() => [
    {
      label: '系统信息',
      key: 'config',
      path: `${router.basename}/system`,
      icon: <SettingOutlined />,
      children: [
        {
          label: '配置管理',
          onClick: () => setSystemOpen(true),
        },
        {
          label: '证书管理',
          onClick: () => setCertOpen(true),
        }
      ],
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

  const handleMenuSelect = ({ keyPath }: { keyPath: string[] }) => {
    if (keyPath.includes('config')) {
      return;
    }

    setActiveMenuKeys(keyPath);
  };

  useMount(() => {
    const defaultItem = items.find((_) => window.location.pathname.endsWith(_.path as string));

    setActiveMenuKeys(defaultItem?.key ? [defaultItem?.key] : []);
  });

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
          selectedKeys={activeMenuKeys}
          style={{ flex: 1, minWidth: 0, flexDirection: 'row-reverse', border: 0 }}
          onSelect={handleMenuSelect}
        />
      </Header>
      <Content>
        <div className="content-body">
          <RouterProvider router={router} />
        </div>
      </Content>
      <System open={systemOpen} onClose={() => setSystemOpen(false)} />
      <Certificate open={certOpen} onClose={() => setCertOpen(false)} />
    </Layout>
  );
};
