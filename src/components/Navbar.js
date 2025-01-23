'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebaseConfig'; // Import Firebase auth
import { signOut } from 'firebase/auth'; // Import signOut
import { useAuth } from '@/lib/auth'; // Import Auth Context
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Camera,
  ChevronDown,
  User,
  LogOut,
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth(); // Get user from Auth Context

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error.message);
      alert('Failed to log out.');
    }
  };

  const navItems = [
    { href: '/', label: 'Home' },
    {
      label: 'Features',
      children: [
        { href: '/portfolio', label: 'Portfolio' },
        { href: '/booking', label: 'Booking System' },
        { href: '/sharing', label: 'Photo Sharing' },
      ],
    },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const NavLink = ({ href, label, isActive, children }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {href ? (
          <Link href={href}>
            <span
              className={`px-4 py-2 rounded-full transition-all duration-200 ${
                isActive
                  ? 'text-indigo-600 bg-white'
                  : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              {label}
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-1 cursor-pointer px-4 py-2 rounded-full text-gray-700 hover:text-indigo-600">
            {label}
            <ChevronDown className="w-4 h-4" />
          </div>
        )}

        {children && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 mt-2 py-2 bg-white rounded-lg shadow-lg border border-gray-100 min-w-[200px]"
          >
            {children.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <>
      <motion.nav
        initial={false}
        animate={{
          backgroundColor: isScrolled
            ? 'rgb(255, 255, 255)'
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: isScrolled ? 'blur(12px)' : 'blur(8px)',
          borderBottom: isScrolled
            ? '1px solid rgb(226, 232, 240)'
            : '1px solid transparent',
        }}
        className="fixed top-0 left-0 w-full z-50"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Camera className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Snapper
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  href={item.href}
                  label={item.label}
                  isActive={pathname === item.href}
                  children={item.children}
                />
              ))}
            </div>

            {/* User Authentication */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">
                    Welcome, <b>{user.email}</b>
                  </span>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-indigo-600">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-indigo-600 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>
    </>
  );
}
