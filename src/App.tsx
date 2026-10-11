import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout'
import ConvertPage from './pages/ConvertPage'
import HomePage from './pages/HomePage'
import { FaqPage, PrivacyPage } from './pages/InfoPages'
import NotFoundPage from './pages/NotFoundPage'
import ResultPage from './pages/ResultPage'
import ToolLandingPage from './pages/ToolLandingPage'
import AddWatermarkPage from './pages/tools/AddWatermarkPage'
import EditPdfPage from './pages/tools/EditPdfPage'
import MergePdfPage from './pages/tools/MergePdfPage'
import ProtectPdfPage from './pages/tools/ProtectPdfPage'
import RemoveWatermarkPage from './pages/tools/RemoveWatermarkPage'
import RotatePdfPage from './pages/tools/RotatePdfPage'
import SplitPdfPage from './pages/tools/SplitPdfPage'

// Data router is required for useBlocker (leave-page guard).
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/convert', element: <ConvertPage /> },
      { path: '/convert/result/:jobId', element: <ResultPage /> },
      // Dedicated interactive PDF tools
      { path: '/tools/merge-pdf', element: <MergePdfPage /> },
      { path: '/tools/add-watermark', element: <AddWatermarkPage /> },
      { path: '/tools/remove-watermark', element: <RemoveWatermarkPage /> },
      { path: '/tools/edit-pdf', element: <EditPdfPage /> },
      { path: '/tools/rotate-pdf', element: <RotatePdfPage /> },
      { path: '/tools/split-pdf', element: <SplitPdfPage /> },
      { path: '/tools/protect-pdf', element: <ProtectPdfPage /> },
      // Standard conversion & format landing pages
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
