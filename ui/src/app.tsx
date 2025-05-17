import React, { useMemo, useState } from 'react';
import { Layout, Menu, Image, Typography, Space, theme } from 'antd';
import { SettingOutlined, ApiOutlined, DashboardOutlined, SwapOutlined } from '@ant-design/icons';
import { RouterProvider } from 'react-router-dom';
import { useMount } from 'ahooks';
import { router } from './route';
import { System } from './pages/system/config';
import { Certificate } from './pages/system/certificate';
import { LLMConfig } from './pages/system/llm';
import { AppContext } from './context';
import { SystemProxySwitch } from './system-proxy-switch';
import { SystemLogs } from './pages/system/logs';
import './style.scss';

const { Header, Content } = Layout;

export const App: React.FC = () => {
  const [activeMenuKeys, setActiveMenuKeys] = useState<string[]>([]);
  const [systemOpen, setSystemOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
  const [llmOpen, setLlmOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const items = useMemo(
    () => [
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
          },
          {
            label: '模型管理',
            onClick: () => setLlmOpen(true),
          },
          {
            label: '系统日志',
            onClick: () => setLogsOpen(true),
          },
          {
            label: <SystemProxySwitch />,
          },
        ],
      },
      {
        label: '转发设置',
        key: 'proxySetting',
        icon: <SwapOutlined />,
        path: `${router.basename}/proxy`,
        onClick: () => router.navigate('/proxy'),
      },
      {
        label: 'Mock 设置',
        key: 'mock',
        icon: <ApiOutlined />,
        path: `${router.basename}/mock`,
        onClick: () => router.navigate('/mock'),
      },
      {
        label: '监控',
        key: 'dashboard',
        icon: <DashboardOutlined />,
        path: router.basename,
        onClick: () => router.navigate('/'),
      },
    ],
    []
  );

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

  if (location.pathname === '/') {
    location.replace('/management');

    return null;
  }

  return (
    <Layout className="app-container" style={{ background: colorBgContainer }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: colorBgContainer }}>
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
          <AppContext.Provider value={{ showLLMConfig: () => setLlmOpen(true) }}>
            <RouterProvider router={router} />
          </AppContext.Provider>
        </div>
      </Content>
      <System open={systemOpen} onClose={() => setSystemOpen(false)} />
      <Certificate open={certOpen} onClose={() => setCertOpen(false)} />
      <LLMConfig open={llmOpen} onClose={() => setLlmOpen(false)} />
      <SystemLogs open={logsOpen} onClose={() => setLogsOpen(false)} />
    </Layout>
  );
};
