import { ReactNode, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // The editor routes are IDE-style: they own the viewport and scroll inside their
  // own panes. Letting the document scroll there pushes the console out of view
  // (and the footer only adds height nobody wants mid-problem).
  const isEditorRoute = /^\/(problem|scratchpad)(\/|$)/.test(pathname);

  return (
    <div
      className={`bg-gray-50 dark:bg-dark-900 flex flex-col ${
        isEditorRoute ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'
      }`}
    >
      {/* Background atmosphere (dark mode only, hidden via CSS) */}
      <div className="bg-mesh" />
      <div className="bg-noise" />

      <div
        className={`relative z-[1] flex flex-col ${
          isEditorRoute ? 'h-full min-h-0' : 'min-h-screen'
        }`}
      >
        <Header onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
        <div className={`flex flex-1 ${isEditorRoute ? 'min-h-0' : ''}`}>
          {/* Desktop sidebar. On editor routes it has to scroll itself, otherwise
              its full height stretches the viewport-locked shell. */}
          <div className={`hidden lg:block ${isEditorRoute ? 'min-h-0 overflow-y-auto' : ''}`}>
            <Sidebar />
          </div>

          {/* Mobile sidebar overlay */}
          {isMobileSidebarOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-800 shadow-xl overflow-y-auto border-r border-gray-200 dark:border-dark-500">
                <div className="pt-2">
                  <Sidebar onNavigate={() => setIsMobileSidebarOpen(false)} />
                </div>
              </div>
            </div>
          )}

          <main className={`flex-1 p-6 min-w-0 ${isEditorRoute ? 'min-h-0 overflow-hidden' : ''}`}>
            {children}
          </main>
        </div>
        {!isEditorRoute && <Footer />}
      </div>
    </div>
  );
}
