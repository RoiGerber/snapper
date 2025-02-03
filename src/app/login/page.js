'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowRight,
  Mail as MailIcon
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  fetchSignInMethodsForEmail 
} from 'firebase/auth';
import { auth, db } from '@/lib/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const InputField = ({ 
  type, 
  value, 
  onChange, 
  placeholder, 
  icon: Icon, 
  showPasswordToggle = false,
  disabled = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPassword ? 'text' : type;

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Icon className="w-5 h-5" />
      </div>
      <input
        type={inputType}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl
                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                 bg-gray-50 focus:bg-white transition-all duration-200
                 placeholder-gray-400 text-gray-700 ${disabled ? 'bg-gray-100' : ''}`}
        required
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                   hover:text-gray-600 transition-colors"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
};

const SocialButton = ({ icon: Icon, label, onClick, variant = "outline" }) => (
  <Button
    type="button"
    variant={variant}
    onClick={onClick}
    className="w-full flex items-center justify-center gap-2 py-3 border
             border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </Button>
);

// A simple role selector used in the "complete registration" flow
const UserTypeSelector = ({ selectedType, onChange }) => (
  <div className="grid grid-cols-2 gap-4">
    <button
      type="button"
      onClick={() => onChange('photographer')}
      className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all
                ${selectedType === 'photographer'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'}`}
    >
      <Camera className="w-6 h-6" />
      <span className="font-medium">צלם</span>
    </button>
    <button
      type="button"
      onClick={() => onChange('client')}
      className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all
                ${selectedType === 'client'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'}`}
    >
      <Mail className="w-6 h-6" />
      <span className="font-medium">לקוח</span>
    </button>
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // For regular login errors
  const [error, setError] = useState('');
  
  // State to handle a Google sign-in user who needs to complete registration
  const [incompleteRegistration, setIncompleteRegistration] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [googleUserEmail, setGoogleUserEmail] = useState('');
  
  // Fields for completing registration
  const [userType, setUserType] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [regError, setRegError] = useState('');

  // Checks the sign-in methods for the entered email and, if it includes Google, calls handleGoogleSignIn.
  const checkGoogleSignIn = async (email) => {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      console.log('Sign-in methods:', signInMethods);
      if (signInMethods.includes('google.com')) {
        handleGoogleSignIn();
      } else {
        setError('המשתמש עם כתובת האימייל הזו לא רשום. אנא הירשם.');
      }
    } catch (err) {
      console.log('Error checking sign-in methods:', err.message);
    }
  };

  // Regular email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) {
      // If wrong password or user-not-found, check if it might be a Google user
      if (
        err.message === 'Firebase: Error (auth/wrong-password).' ||
        err.message === 'Firebase: Error (auth/invalid-credential).'
      ) {
        await checkGoogleSignIn(email);
      } else if (err.message === 'Firebase: Error (auth/user-not-found).') {
        setError('המשתמש עם כתובת האימייל הזו לא רשום. אנא הירשם.');
      } else {
        console.log('Error logging in:', err.message);
        setError(err.message);
      }
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Check if the user already has registration details in Firestore
      const userDocRef = doc(db, 'usersDB', user.email);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        // Registered user: continue to app
        router.push('/');
      } else {
        // Unregistered Google user: set state to complete registration
        setGoogleUserEmail(user.email);
        setIsGoogleUser(true);
        setIncompleteRegistration(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle submission of the "complete registration" form for a Google user.
  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setRegError('');
    if (!userType) {
      setRegError('אנא בחר תפקיד (צלם או לקוח).');
      return;
    }
    if (!phoneNumber) {
      setRegError('אנא הזן מספר טלפון.');
      return;
    }
    try {
      await setDoc(doc(db, 'usersDB', googleUserEmail), {
        email: googleUserEmail,
        phoneNumber,
        role: userType,
      });
      router.push('/');
    } catch (err) {
      console.error('Error completing registration:', err);
      setRegError('אירעה שגיאה בעת השלמת הרשמה. אנא נסה שוב.');
    }
  };

  // If the user is a Google user that must complete registration, show that form.
  if (incompleteRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 to-purple-50" />
        
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        </div>
  
        <motion.div 
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 w-full max-w-md relative"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-xl">
                <Mail className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              השלם הרשמה
            </h2>
            <p className="text-gray-500 mt-2">
              אנא השלם את פרטיך (תפקיד ומספר טלפון) כדי להמשיך.
            </p>
          </div>
  
          {regError && <p className="text-red-500 text-center mb-4 text-sm">{regError}</p>}
  
          <form onSubmit={handleCompleteRegistration} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">אני..</label>
              <UserTypeSelector selectedType={userType} onChange={setUserType} />
            </div>
  
            <InputField
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="מספר טלפון"
              icon={Mail}  // You can change the icon if desired
            />
  
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 
                       hover:from-indigo-700 hover:to-purple-700 text-white py-3
                       rounded-xl flex items-center justify-center gap-2"
            >
              השלם הרשמה
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Otherwise, show the standard login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 to-purple-50" />
      
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      </div>
  
      <motion.div 
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 w-full max-w-md relative"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-xl">
              <Camera className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ברוך שובך!
          </h2>
          <p className="text-gray-500 mt-2">אנא התחבר כדי להמשיך.</p>
        </div>
  
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="כתובת אימייל"
            icon={Mail}
          />
          
          <InputField
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="סיסמה"
            icon={Lock}
            showPasswordToggle
          />
  
          {error && <p className="text-red-500 text-sm">{error}</p>}
  
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
              <span className="text-gray-600">תזכור אותי לפעם הבאה</span>
            </label>
            <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-700">
              שכחת סיסמא?
            </Link>
          </div>
  
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 
                     hover:from-indigo-700 hover:to-purple-700 text-white py-3
                     rounded-xl flex items-center justify-center gap-2"
          >
            התחבר
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
  
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">או התחבר באמצעות</span>
          </div>
        </div>
  
        <div className="grid gap-4">
          <SocialButton
            icon={MailIcon}
            label="Google"
            onClick={handleGoogleSignIn}
          />
        </div>
  
        <p className="text-sm text-center text-gray-500 mt-8">
          אין לך חשבון עדיין?{' '}
          <Link 
            href="/register" 
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            הרשם
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
