import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface StorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

const navigationItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/stories/dashboard', icon: '📊' },
  { id: 'stories', label: 'Stories', href: '/stories', icon: '📝' },
  { id: 'epics', label: 'Epics', href: '/stories/epics', icon: '🎯' },
  { id: 'reports', label: 'Reports', href: '/stories/reports', icon: '📈' },
  { id: 'settings', label: 'Settings', href: '/stories/settings', icon: '⚙️' },
];

export const StorySidebar: React.FC<StorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  currentPage 
}) => {
  const router = useRouter();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`story-sidebar ${isOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/stories" className="flex items-center">
            <div className="text-2xl font-bold text-brand-blue">
              Medtrion
            </div>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`nav-item ${
                    currentPage === item.id ? 'active' : ''
                  }`}
                  onClick={() => onClose()}
                >
                  <span className="nav-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Quick Actions */}
        <div className="p-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/stories/create"
                className="btn btn-primary btn-sm w-full"
                onClick={() => onClose()}
              >
                <span aria-hidden="true">➕</span>
                Create Story
              </Link>
              <Link
                href="/stories/epics/create"
                className="btn btn-secondary btn-sm w-full"
                onClick={() => onClose()}
              >
                <span aria-hidden="true">🎯</span>
                Create Epic
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Stories */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Recent Stories</h3>
          <div className="space-y-2">
            <Link
              href="/stories/US-001"
              className="block p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
              onClick={() => onClose()}
            >
              US-001: User Authentication
            </Link>
            <Link
              href="/stories/US-002"
              className="block p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
              onClick={() => onClose()}
            >
              US-002: Product Catalog
            </Link>
            <Link
              href="/stories/US-003"
              className="block p-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
              onClick={() => onClose()}
            >
              US-003: Shopping Cart
            </Link>
          </div>
        </div>

        {/* User Section */}
        <div className="mt-auto p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center text-white font-medium">
              PO
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">Product Owner</div>
              <div className="text-xs text-gray-500">Sarah Johnson</div>
            </div>
          </div>
          <button
            className="mt-3 text-sm text-gray-500 hover:text-gray-700"
            onClick={() => {
              // Handle logout
              console.log('Logout clicked');
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};