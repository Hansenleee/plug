import { createBrowserRouter } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import MockPage from './pages/mock';

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
  ],
  {
    basename: '/management',
  }
);
