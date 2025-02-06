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
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig"; // Adjust to your config path
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
  const [userRole, setUserRole] = useState(null); // Add state for user role
  const { user } = useAuth(); // Get user from Auth Context

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Fetch user role from Firestore when user is authenticated
    const getUserRole = async (uid) => {
      try {
        const userRef = doc(db, "usersDB", uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role); // Set role in state
        } else {
          console.error("No role found for user");
        }
      } catch (error) {
        console.error("Error fetching role:", error.message);
      }
    };

    if (user) {
      getUserRole(user.email); // Fetch role when user is authenticated
    }
  }, [user]);

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
    { href: '/', label: 'דף הבית' },
    { href: '/pricing', label: 'מחירים' },
    { href: '/about', label: 'אודות' },
    { href: '/how-it-works', label: 'כיצד זה עובד' },
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
              Tsalamim
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
            
            {/* Conditional links based on role */}
            {userRole === "client" && (
              <>
                <NavLink href="/myevents" label="האירועים שלי" />
                <NavLink href="/postevent" label="בקשת צלם לאירוע" />
              </>
            )}
            {userRole === "photographer" && (
              <>
                <NavLink href="/marketplace" label="מצא אירוע" />
                <NavLink href="/manage" label="ניהול האירועים שלי" />
              </>
            )}
          </div>

          {/* User Authentication */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">
                  שלום, <b>{user.email}</b>
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  התנתק
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-indigo-600">
                    התחבר
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-indigo-600 text-white">
                    הרשמה
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 w-full bg-white shadow-lg border-t border-gray-200 z-50 h-auto flex flex-col items-center space-y-4 py-6"
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block text-gray-700 py-3 px-6 text-lg w-full text-center hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)} // Close menu when clicking a link
              >
                {item.label}
              </Link>
            ))}

            {/* Conditional links based on role */}
{userRole === "client" && (
  <>
    <Link 
      href="/myevents" 
      className="w-full text-center"
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Button variant="ghost" className="w-full text-indigo-600">
        האירועים שלי
      </Button>
    </Link>
    <Link 
      href="/postevent" 
      className="w-full text-center"
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Button variant="ghost" className="w-full text-indigo-600">
        בקשת צלם לאירוע
      </Button>
    </Link>
  </>
)}
{userRole === "photographer" && (
  <>
    <Link 
      href="/marketplace" 
      className="w-full text-center"
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Button variant="ghost" className="w-full text-indigo-600">
        מצא אירוע
      </Button>
    </Link>
    <Link 
      href="/manage" 
      className="w-full text-center"
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Button variant="ghost" className="w-full text-indigo-600">
        ניהול האירועים שלי
      </Button>
    </Link>
  </>
)}

{/* User Authentication (Mobile) */}
{user ? (
  <>
    <span className="text-gray-700">שלום, <b>{user.email}</b></span>
    <Button 
      onClick={() => {
        handleLogout();
        setIsMobileMenuOpen(false);
      }} 
      variant="outline" 
      className="text-red-600 w-full"
    >
      <LogOut className="w-5 h-5 mr-2" />
      התנתק
    </Button>
  </>
) : (
  <>
    <Link 
      href="/login" 
      className="w-full text-center"
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Button variant="ghost" className="w-full text-indigo-600">
        התחבר
      </Button>
    </Link>
    <Link 
      href="/register" 
      className="w-full text-center"
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Button className="w-full bg-indigo-600 text-white">
        הרשמה
      </Button>
    </Link>
  </>
)}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
