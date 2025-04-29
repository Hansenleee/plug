import { createBrowserRouter } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import MockPage from './pages/mock';
import ForwardingPage from './pages/forwarding';

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
      element: <ForwardingPage />,
    },
  ],
  {
    basename: '/management',
  }
);
