'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
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
  const [userRole, setUserRole] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const getUserRole = async (email) => {
      try {
        const userRef = doc(db, "usersDB", email);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      } catch (error) {
        console.error("Error fetching role:", error.message);
      }
    };

    if (user) {
      getUserRole(user.email); 
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  const navItems = [
    { href: '/', label: 'בית' },
    { href: '/pricing', label: 'מחירים' },
    { href: '/about', label: 'אודות' },
    { href: '/gallery', label: 'גלריה' },
    { href: '/how-it-works', label: 'איך זה עובד' },
    { href: '/contact', label: 'צור קשר' },
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
              className={`px-3 py-2 rounded-full transition-all duration-200 text-sm font-medium ${
                isActive
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              {label}
            </span>
          </Link>
        ) : (
          <div className="flex items-center gap-1 cursor-pointer px-3 py-2 rounded-full text-gray-600 hover:text-indigo-600">
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
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
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
            <Camera className="w-7 h-7 text-indigo-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Tsalamim
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                href={item.href}
                label={item.label}
                isActive={pathname === item.href}
                children={item.children}
              />
            ))}
            
            {/* Role-based links */}
            {userRole === "client" && (
              <>
                <NavLink href="/myevents" label="האירועים שלי" />
                <NavLink href="/postevent" label="חפש צלם" />
              </>
            )}
            {userRole === "photographer" && (
              <>
                <NavLink href="/marketplace" label="מצא אירוע" />
                <NavLink href="/manage" label="ניהול אירועים" />
              </>
            )}
          </div>

          {/* User Authentication */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600 max-w-[160px] truncate">
                  שלום, <span className="font-medium">{user.email}</span>
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 border-red-100 hover:border-red-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  התנתק
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-indigo-600">
                    התחבר
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
                    הרשמה
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
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

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 w-full bg-white shadow-lg border-t border-gray-200 z-50 flex flex-col items-center py-4"
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="w-full py-2.5 px-4 text-gray-700 text-base text-center hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Role-based links */}
            {userRole === "client" && (
              <>
                <Link href="/myevents" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-indigo-600">
                    אירועים שלי
                  </Button>
                </Link>
                <Link href="/postevent" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-indigo-600">
                    בקשת צלם
                  </Button>
                </Link>
              </>
            )}
            {userRole === "photographer" && (
              <>
                <Link href="/marketplace" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-indigo-600">
                    מצא אירוע
                  </Button>
                </Link>
                <Link href="/manage" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-indigo-600">
                    ניהול אירועים
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Authentication */}
            <div className="w-full px-4 border-t border-gray-100 mt-4 pt-4">
              {user ? (
                <Button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }} 
                  variant="outline" 
                  className="w-full text-red-600 border-red-100 hover:border-red-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  התנתק
                </Button>
              ) : (
                <>
                  <Link href="/login" className="block w-full mb-2">
                    <Button variant="ghost" className="w-full text-indigo-600">
                      התחבר
                    </Button>
                  </Link>
                  <Link href="/register" className="block w-full">
                    <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
                      הרשמה
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}