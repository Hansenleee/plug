import { createBrowserRouter } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import MockPage from './pages/mock';
import ProxyPage from './pages/proxy';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Dashboard />,
    },
    {
      path: '/mock',
      element: <MockPage />,
    },
    {
      path: '/proxy',
      element: <ProxyPage />,
    },
  ],
  {
    basename: '/management',
  }
);
