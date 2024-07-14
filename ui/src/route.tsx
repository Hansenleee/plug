import { createBrowserRouter } from 'react-router-dom';
import Dashbord from './pages/dashboard';

export const router = createBrowserRouter(
  [
    {
      path: '/management',
      element: <Dashbord />,
    },
  ],
  {
    // basename: 'management'
  }
);
