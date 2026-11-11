import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackVisit } from '../../lib/analytics';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { DrawerTools } from './Tools';
import FeedbackModal from '../FeedbackModal/FeedbackModal';
import { useFlashCards } from '../../hooks/useFlashCards';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { pathname } = useLocation();
  // Only cards the learner has reviewed before count as due: a first-time
  // visitor has new cards to try, not a backlog.
  const { getReviewDueCount } = useFlashCards();
  const flashDueCount = getReviewDueCount();
  useEffect(() => {
    trackVisit();
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;
    window.gtag?.('event', 'page_view', { page_location: `https://mlgrind.dev${pathname}`, page_path: pathname });
  }, [pathname]);

  // The editor routes are IDE-style: they own the viewport and scroll inside their
  // own panes. Letting the document scroll there pushes the console out of view
  // (and the footer only adds height nobody wants mid-problem).
  const isEditorRoute = /^\/(problem|scratchpad)(\/|$)/.test(pathname);
  // Focus layout: problem pages give the editor the full width (the header's menu
  // button opens the curriculum as a drawer there on desktop too), and the home page
  // already shows the grouped curriculum, so neither docks the sidebar.
  const isProblemRoute = /^\/problem(\/|$)/.test(pathname);
  const hideDockedSidebar = pathname === '/' || isProblemRoute;
  const closeDrawer = () => setIsMobileSidebarOpen(false);

  // Escape closes the drawer; navigating anywhere closes it too.
  useEffect(() => {
    if (!isMobileSidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileSidebarOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMobileSidebarOpen]);
  useEffect(() => setIsMobileSidebarOpen(false), [pathname]);

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
        <Header
          onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isMenuOpen={isMobileSidebarOpen}
          menuOnDesktop={isProblemRoute}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
        />
        <div className={`flex flex-1 ${isEditorRoute ? 'min-h-0' : ''}`}>
          {/* Desktop sidebar. On editor routes it has to scroll itself, otherwise
              its full height stretches the viewport-locked shell. */}
          {!hideDockedSidebar && (
            <div className={`hidden lg:block ${isEditorRoute ? 'min-h-0 overflow-y-auto' : ''}`}>
              <Sidebar />
            </div>
          )}

          {/* Mobile sidebar overlay */}
          {isMobileSidebarOpen && (
            <div className={`fixed inset-0 z-40 ${isProblemRoute ? '' : 'lg:hidden'}`}>
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeDrawer}
              />
              <div
                id="curriculum-drawer"
                className="fixed top-16 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-dark-800 shadow-xl overflow-y-auto border-r border-gray-200 dark:border-dark-500"
              >
                <div className="pt-2">
                  <Sidebar
                    inDrawer
                    onNavigate={closeDrawer}
                    extra={
                      <DrawerTools
                        flashDueCount={flashDueCount}
                        onOpenFeedback={() => setIsFeedbackOpen(true)}
                        onNavigate={closeDrawer}
                      />
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <main className={`flex-1 p-6 min-w-0 ${isEditorRoute ? 'min-h-0 overflow-hidden' : ''}`}>
            {children}
          </main>
        </div>
        {!isEditorRoute && <Footer onOpenFeedback={() => setIsFeedbackOpen(true)} />}
      </div>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
}
