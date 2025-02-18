'use client'

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ChevronDownIcon, 
  UserIcon, 
  CameraIcon, 
  ShareIcon, 
  MessageSquareIcon,
  ArrowRightIcon,
  StarIcon,
  CheckCircleIcon,
  UserSearch,
  CalendarIcon,
  CloudUploadIcon
} from 'lucide-react';
import { DirectionProvider } from '@radix-ui/react-direction';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

function TestimonialCard({ name, role, content }) {
  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-lg border border-indigo-50"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center mb-4">
        <div className="flex text-yellow-400 mb-2">
          {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className="w-4 h-4 fill-current" />
          ))}
        </div>
      </div>
      <p className="text-gray-700 mb-4">{content}</p>
      <div className="flex items-center">
        <div className="bg-indigo-100 rounded-full w-10 h-10 flex items-center justify-center">
          <span className="text-indigo-600 font-semibold">{name[0]}</span>
        </div>
        <div className="mr-3">
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: 'תיקי עבודות מרשימים',
      description: 'צלמים בתחילת דרכם יכולים לבנות תיק עבודות מרשים ולהציג את עבודותיהם.',
      icon: CameraIcon,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'הזמנה קלה',
      description:  'מערכת הזמנות חכמה, להתאמת צלם לאירוע שלך בקלות ובמהירות.',
      icon: UserIcon,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'צפייה והורדת התמונות מיד לאחר האירוע',
      description: 'מיד לאחר האירוע הצלם מעלה את התמונות למערכת האתר והתמונות זמינות לצפייה והורדה מהענן.',
      icon: ShareIcon,
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'תקשורת מיידית',
      description: 'מיד לאחר ההזמנה תקבלו את פרטי הצלם ותוכלו לתקשר איתו ישירות, מערכת ההתראות תתזכר אתכם לקראת האירוע ולאחר העלאת התמונות.',
      icon: MessageSquareIcon,
      color: 'from-orange-500 to-red-500'
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-indigo-50" dir="rtl">
      <div className="container mx-auto px-4">
        <motion.div 
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            למה לבחור ב-Tsalamim?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            הצטרפו לאלפי צלמים ולקוחות שסומכים על Tsalamim לצרכי הצילום שלהם
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white p-6 rounded-xl shadow-lg border border-indigo-50"
            >
              <div className={`bg-gradient-to-r ${feature.color} p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-6`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <Link href="/how-it-works">
                <Button 
                  variant="ghost"
                  className="text-indigo-600 hover:text-indigo-700 p-0 flex items-center"
                >
                  למד עוד <ArrowRightIcon className="w-4 h-4 mr-2" />
                </Button>
              </Link>
              
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-4"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block mb-6"
        >
          <span className="px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
            ✨ העתיד של הזמנת צילומים
          </span>
        </motion.div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"  style={{ fontFamily: 'Alef, sans-serif' }}>
            ברוכים הבאים ל-Tsalamim
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          אנחנו מחברים בין צלמים בתחילת דרכם לבין בעלי אירועים קטנים שרוצים לתעד את האירוע שלהם בלי להוציא סכומים גדולים.
         <br/>
         <br/>
          הצטרפו לאלפי לקוחות מרוצים עוד היום!
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
          <Link href="/register">
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg transform transition hover:-translate-y-0.5"
            >
              התחל עכשיו
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-full"
            >
              התחבר
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900" style={{marginLeft:"5vh"}}>+100</div>
            <div className="text-gray-600" style={{marginLeft:"4vh"}}>צלמים</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900" style={{marginLeft:"5vh"}}>+500</div>
            <div className="text-gray-600" style={{marginLeft:"5vh"}}>לקוחות מרוצים</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900" style={{marginLeft:"5vh"}}>99%</div>
            <div className="text-gray-600" style={{marginLeft:"5vh"}}>שביעות רצון</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: "אביעד כלפה",
      role: "מסיבת חינה",
      content: "הזמנו צלם לחינה שלנו, והתמונות היו מדהימות, במחיר הכי זול שמצאתי."
    },
    {
      name: "מיכל סלע",
      role: "לקוחה",
      content: "הזמנו כבר לשלושה אירועים שונים והיינו מרוצים מאוד מהתוצאות."
    },
    {
      name: "הילה נאור",
      role: "צלמת אירועים",
      content: "בתחילת דרכי בניתי את תיק העבדות שלי דרך Tsalamim, וזה היה הבחירה הכי טובה שלי."
    }
  ];

  return (
    <section className="py-20 bg-indigo-50" dir="rtl">
      <div className="container mx-auto px-4">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            מה המשתמשים שלנו אומרים
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            הצטרפו לקהילה שלנו של צלמים ולקוחות מרוצים
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}


function HowItWorksSection() {
  const steps = [
    {
      title: 'נרשמים כמשתמשים באתר',
      description: '',
      icon: UserIcon,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'ממלאים טופס ובו תזינו את פרטי האירוע שלכם',
      description: 'כתובת, תאריך, שעה, וכמובן סוג האירוע שתרצו לתעד.',
      icon: CalendarIcon,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'פרטי תשלום',
      description: 'תועברו לטופס הזנת פרטי תשלום, החיוב בפועל יתבצע רק לאחר שהמערכת תמצא צלם עבורכם.',
      icon: MessageSquareIcon,
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'חיפוש אוטומטי של צלם עבור האירוע שלכם',
      description: 'המערכת אוטומטית תעדכן אתכם בSMS ובאתר כשאר נקבע הצלם לאירוע שלכם בצירוף פרטי ההתקשרות איתו.',
      icon: UserSearch ,
      color: 'from-purple-500 to-teal-500'
    },
    {
      title: 'קבלו את התמונות',
      description: 'מזל טוב! חגגתם באירוע משמח! בתוך כ24 שעות, הצלם יעלה את התמונות ללא סינון או עריכה למערכת האתר, והתמונות יהיו זמינות עבורכם להורדה למשך חודש.',
      icon: CloudUploadIcon,
      color: 'from-orange-500 to-amber-500'
    }
  ];

  return (
    <section className="py-20 bg-white" dir="rtl">
      <div className="container mx-auto px-4">
        <motion.div 
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            איך זה עובד?
          </h2>
        </motion.div>

        <div className="relative flex flex-col lg:flex-row gap-8 lg:gap-4">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-[120px] left-0 right-0 h-1 bg-gradient-to-r from-indigo-100 to-purple-100"></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative flex-1 group bg-white lg:bg-transparent p-6 rounded-2xl lg:shadow-none lg:hover:shadow-none transition-all"
            >
              {/* Step number connector */}
              <div className="hidden lg:block absolute top-[104px] left-[-32px] right-[-32px] h-1 bg-gradient-to-r from-indigo-100 to-purple-100"></div>

              <div className="relative z-10 text-center">
                {/* Step number */}
                <div className="mx-auto mb-6 w-16 h-16 flex items-center justify-center bg-white border-2 border-indigo-100 rounded-full text-2xl font-bold text-indigo-600">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div className={`mx-auto p-3 rounded-lg w-14 h-14 flex items-center justify-center`}>
                    <step.icon className={`w-8 h-8 ${step.color.replace('bg-gradient-to-r', 'text-gradient')}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>

              {/* Mobile connector */}
              {index !== steps.length - 1 && (
                <div className="lg:hidden absolute top-[50%] right-[-40px] w-8 h-1 bg-indigo-100"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
);
}

export default function getStarted() {
  return (
    <DirectionProvider dir="rtl"> 
      <main className="min-h-screen">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <TestimonialsSection />
      </main>
    </DirectionProvider>
  );
}
