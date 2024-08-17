import { createBrowserRouter } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import BaseMock from './pages/mock/base';
import YapiMock from './pages/mock/yapi';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Dashboard />,
    },
    {
      path: '/mock/base',
      element: <BaseMock />,
    },
    {
      path: '/mock/yapi',
      element: <YapiMock />,
    },
  ],
  {
    basename: '/management',
  }
);
