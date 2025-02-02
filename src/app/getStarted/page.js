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
  StarIcon
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
      description: 'צרו סיפורים חזותיים מרהיבים שמושכים תשומת לב. הפלטפורמה שלנו מציעה תבניות יפות ואפשרויות התאמה אישית.',
      icon: CameraIcon,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'הזמנה קלה',
      description: 'מערכת תזמון חכמה עם זיהוי אזור זמן אוטומטי ואינטגרציה עם יומן לתיאום חלק.',
      icon: UserIcon,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'שיתוף תמונות חלק',
      description: 'שליחת תמונות במהירות גבוהה עם אחסון בענן וכלי ארגון גלריה חכמים.',
      icon: ShareIcon,
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'תקשורת מיידית',
      description: 'הודעות בזמן אמת עם שיתוף קבצים, חיווי הקלדה והתראות הזמנה אוטומטיות.',
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
            למה לבחור ב-tsalamim?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            הצטרפו לאלפי צלמים ולקוחות שסומכים על tsalamim לצרכי הצילום שלהם
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
              <Button
                variant="ghost"
                className="text-indigo-600 hover:text-indigo-700 p-0 flex items-center"
              >
                למד עוד <ArrowRightIcon className="w-4 h-4 mr-2" />
              </Button>
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
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ברוכים הבאים ל-tsalamim
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          התחברו עם צלמים מובילים, נהלו הזמנות ושתפו זכרונות בצורה חלקה.
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
            <div className="text-3xl font-bold text-gray-900" style={{marginLeft:"5vh"}}>+1000</div>
            <div className="text-gray-600" style={{marginLeft:"4vh"}}>צלמים</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900" style={{marginLeft:"5vh"}}>+50k</div>
            <div className="text-gray-600" style={{marginLeft:"5vh"}}>לקוחות מרוצים</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900" style={{marginLeft:"5vh"}}>99%</div>
            <div className="text-gray-600" style={{marginLeft:"5vh"}}>שביעות רצון</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 z-10"
      >
        <ChevronDownIcon className="w-8 h-8 text-indigo-600" />
      </motion.div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: "שרה ג'ונסון",
      role: "צלמת מקצועית",
      content: "tsalamim שינתה את האופן בו אני מנהלת את עסק הצילום שלי. מערכת ההזמנות חלקה!"
    },
    {
      name: "מייקל צ'ן",
      role: "לקוח",
      content: "מצאתי צלם מדהים לחתונה שלי דרך tsalamim. כל התהליך היה חלק להפליא."
    },
    {
      name: "אמה דייוויס",
      role: "צלמת פורטרטים",
      content: "תכונות תיק העבודות וכלי התקשורת עם הלקוחות הם בדיוק מה שהייתי צריכה לעסק שלי."
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

export default function getStarted() {
  return (
    <DirectionProvider dir="rtl"> 
      <main className="min-h-screen">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
      </main>
    </DirectionProvider>
  );
}
