'use client';

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
  Mail as MailIcon,
  User,
  Users,
  Phone,
} from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const InputField = ({
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  showPasswordToggle = false,
  disabled = false,
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
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
};

const UserTypeSelector = ({ selectedType, onChange }) => (
  <div className="grid grid-cols-2 gap-4">
    <button
      type="button"
      onClick={() => onChange('photographer')}
      className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all
                  ${
                    selectedType === 'photographer'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                  }`}
    >
      <Camera className="w-6 h-6" />
      <span className="font-medium">צלם</span>
    </button>
    <button
      type="button"
      onClick={() => onChange('client')}
      className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all
                  ${
                    selectedType === 'client'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                  }`}
    >
      <User className="w-6 h-6" />
      <span className="font-medium">לקוח</span>
    </button>
  </div>
);

const SocialButton = ({ icon: Icon, label, onClick, variant = 'outline' }) => (
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

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // New state for phone number
  const [isGoogleUser, setIsGoogleUser] = useState(false); // Track if Google user
  const [formError, setFormError] = useState(''); // Holds error message to display

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Reset any previous errors
      setFormError('');

      // Set email from Google user (you may use it for backend storage)
      setEmail(user.email);
      setIsGoogleUser(true);

      // Note: We are no longer checking for a phone number from the Google user.
      // Instead, the form below will require the user to fill in a phone number.
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setFormError('אירעה שגיאה במהלך התחברות עם גוגל. אנא נסה שוב.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate required fields
    if (!userType) {
      setFormError('אנא בחר תפקיד (צלם או לקוח).');
      return;
    }

    if (!phoneNumber) {
      setFormError('אנא הזן מספר טלפון.');
      return;
    }

    if (!isGoogleUser && password !== confirmPassword) {
      setFormError('הסיסמאות לא תואמות.');
      return;
    }

    try {
      if (isGoogleUser) {
        // For Google user, the email and password fields are hidden.
        const user = auth.currentUser;
        await setDoc(doc(db, 'usersDB', user.email), {
          email: user.email,
          phoneNumber,
          role: userType,
        });
      } else {
        // Handle email/password registration
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await setDoc(doc(db, 'usersDB', user.email), {
          email: user.email,
          phoneNumber,
          role: userType,
        });
      }
      router.push('/');
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.code === 'auth/email-already-in-use') {
        setFormError('כתובת האימייל בשימוש. אנא השתמש בכתובת אחרת.');
      } else {
        setFormError('אירעה שגיאה בעת יצירת החשבון. אנא נסה שוב.');
      }
    }
  };

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
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            צור חשבון
          </h2>
          <p className="text-gray-500 mt-2">הצטרף לקהילה שלנו היום</p>
        </div>

        {/* Display error message (if any) */}
        {formError && (
          <p className="text-red-500 text-center mb-4 text-sm">{formError}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">אני..</label>
            <UserTypeSelector selectedType={userType} onChange={setUserType} />
          </div>

          {/* Only render the email input if not a Google user */}
          {!isGoogleUser && (
            <InputField
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="כתובת אימייל"
              icon={Mail}
            />
          )}

          {/* Only render password fields if not a Google user */}
          {!isGoogleUser && (
            <>
              <InputField
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="סיסמה"
                icon={Lock}
                showPasswordToggle
              />

              <InputField
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="אימות סיסמה"
                icon={Lock}
                showPasswordToggle
              />
            </>
          )}

          <InputField
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="מספר טלפון"
            icon={Phone}
          />

          <div className="text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded text-indigo-600 focus:ring-indigo-500"
                required
              />
              <span className="text-gray-600">
                אני מסכים ל{' '}
                <Link href="/terms" className="text-indigo-600 hover:text-indigo-700">
                  תנאי השירות
                </Link>{' '}
                ו{' '}
                <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700">
                  מדיניות הפרטיות
                </Link>
              </span>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 
                       hover:from-indigo-700 hover:to-purple-700 text-white py-3
                       rounded-xl flex items-center justify-center gap-2"
          >
            צור חשבון
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

        <div>
          <SocialButton
            icon={MailIcon}
            label="Google"
            onClick={handleGoogleSignIn}
          />
        </div>

        <p className="text-sm text-center text-gray-500 mt-8">
          כבר יש לך חשבון?{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            התחבר
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
