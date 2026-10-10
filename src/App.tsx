import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout'
import ConvertPage from './pages/ConvertPage'
import HomePage from './pages/HomePage'
import { FaqPage, PrivacyPage } from './pages/InfoPages'
import NotFoundPage from './pages/NotFoundPage'
import ResultPage from './pages/ResultPage'
import ToolLandingPage from './pages/ToolLandingPage'

// Data router is required for useBlocker (leave-page guard).
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/convert', element: <ConvertPage /> },
      { path: '/convert/result/:jobId', element: <ResultPage /> },
      { path: '/tools/:slug', element: <ToolLandingPage /> },
      { path: '/faq', element: <FaqPage /> },
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
