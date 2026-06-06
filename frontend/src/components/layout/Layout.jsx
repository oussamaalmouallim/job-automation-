import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50 md:h-screen md:overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col md:overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 sm:px-5 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
