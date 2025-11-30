import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, BookOpen, Menu, X, HandHeart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hallDropdownOpen, setHallDropdownOpen] = useState(false);
  const [sevaDropdownOpen, setSevaDropdownOpen] = useState(false);

  const isActive = (path: string) => router.pathname === path;

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/hall_booking', label: 'Function Hall Bookings', icon: BookOpen },
    { href: '/seva_bookings', label: 'Seva Bookings', icon: HandHeart },
  ];

  const hallDropdownLinks = [
    { href: '/calendar', label: 'Calendar' },
    { href: '/hall_booking', label: 'New Booking' },
  ];

  const sevaDropdownLinks = [
    { href: '/seva_bookings', label: 'Book Seva' },
    { href: '/seva_bookings/view', label: 'Sevas Booked Today' },
    { href: '/seva_bookings/reports', label: "Tomorrow's Sevas" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white shadow-md flex justify-center">
        <div className="max-w-7xl px-4 md:px-6 flex items-center justify-between h-16 md:h-20 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/images/logo_1.jpg"
              alt="Temple Banner"
              className="h-16 w-auto group-hover:shadow-lg transition-shadow"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label, icon: Icon }) => {
              if (href === '/hall_booking') {
                return (
                  <div
                    key={href}
                    className="relative"
                    onMouseEnter={() => setHallDropdownOpen(true)}
                    onMouseLeave={() => setHallDropdownOpen(false)}
                  >
                    <Link href={href}>
                      <button
                        className={`flex items-center gap-3 px-6 py-4 rounded-lg transition-all duration-200 ${
                          router.pathname.startsWith('/hall_booking')
                            ? 'bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={24} />
                        <span className="font-semibold text-lg">{label}</span>
                      </button>
                    </Link>
                    {hallDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-4 z-50">
                        {hallDropdownLinks.map((dropdownLink, index) => (
                          <Link key={dropdownLink.href} href={dropdownLink.href}>
                            <div className={`px-8 py-4 hover:bg-gray-100 cursor-pointer text-gray-700 font-semibold text-lg ${index > 0 ? 'mt-2' : ''}`}>
                              {dropdownLink.label}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              if (href === '/seva_bookings') {
                return (
                  <div
                    key={href}
                    className="relative"
                    onMouseEnter={() => setSevaDropdownOpen(true)}
                    onMouseLeave={() => setSevaDropdownOpen(false)}
                  >
                    <Link href={href}>
                      <button
                        className={`flex items-center gap-3 px-6 py-4 rounded-lg transition-all duration-200 ${
                          router.pathname.startsWith('/seva_bookings')
                            ? 'bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={24} />
                        <span className="font-semibold text-lg">{label}</span>
                      </button>
                    </Link>
                    {sevaDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-4 z-50">
                        {sevaDropdownLinks.map((dropdownLink, index) => (
                          <Link key={dropdownLink.href} href={dropdownLink.href}>
                            <div className={`px-8 py-4 hover:bg-gray-100 cursor-pointer text-gray-700 font-semibold text-lg ${index > 0 ? 'mt-2' : ''}`}>
                              {dropdownLink.label}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link key={href} href={href}>
                  <button
                    className={`flex items-center gap-3 px-6 py-4 rounded-lg transition-all duration-200 ${
                      isActive(href) || router.pathname.startsWith(href + '/')
                        ? 'bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={24} />
                    <span className="font-semibold text-lg">{label}</span>
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* Become a Host Button */}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col gap-2">
              {navLinks.map(({ href, label, icon: Icon }) => {
                if (href === '/hall_booking') {
                  return (
                    <div key={href}>
                      <button
                        onClick={() => setHallDropdownOpen(!hallDropdownOpen)}
                        className={`w-full flex items-center gap-3 px-6 py-4 rounded-lg transition-all ${
                          router.pathname.startsWith('/hall_booking')
                            ? 'bg-gradient-to-r from-blue-800 to-blue-900 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={24} />
                        <span className="font-semibold text-lg">{label}</span>
                      </button>
                      {hallDropdownOpen && (
                        <div className="ml-6 mt-2 flex flex-col gap-2">
                          {hallDropdownLinks.map((dropdownLink) => (
                            <Link key={dropdownLink.href} href={dropdownLink.href}>
                              <div
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setHallDropdownOpen(false);
                                }}
                                className="px-8 py-4 hover:bg-gray-100 rounded cursor-pointer text-gray-700 font-semibold text-lg"
                              >
                                {dropdownLink.label}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                if (href === '/seva_bookings') {
                  return (
                    <div key={href}>
                      <button
                        onClick={() => setSevaDropdownOpen(!sevaDropdownOpen)}
                        className={`w-full flex items-center gap-3 px-6 py-4 rounded-lg transition-all ${
                          router.pathname.startsWith('/seva_bookings')
                            ? 'bg-gradient-to-r from-blue-800 to-blue-900 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={24} />
                        <span className="font-semibold text-lg">{label}</span>
                      </button>
                      {sevaDropdownOpen && (
                        <div className="ml-6 mt-2 flex flex-col gap-2">
                          {sevaDropdownLinks.map((dropdownLink) => (
                            <Link key={dropdownLink.href} href={dropdownLink.href}>
                              <div
                                onClick={() => {
                                  setMobileMenuOpen(false);
                                  setSevaDropdownOpen(false);
                                }}
                                className="px-8 py-4 hover:bg-gray-100 rounded cursor-pointer text-gray-700 font-semibold text-lg"
                              >
                                {dropdownLink.label}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link key={href} href={href}>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-6 py-4 rounded-lg transition-all ${
                        isActive(href) || router.pathname.startsWith(href + '/')
                          ? 'bg-gradient-to-r from-blue-800 to-blue-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={24} />
                      <span className="font-semibold text-lg">{label}</span>
                    </button>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex justify-center">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>© 2024 HallBook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
