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
        <div className="ml-3">
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
      title: 'Showcase Portfolios',
      description: 'Create stunning visual stories that capture attention. Our platform offers beautiful templates and customization options.',
      icon: CameraIcon,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Effortless Booking',
      description: 'Smart scheduling system with automatic timezone detection and calendar integration for seamless coordination.',
      icon: UserIcon,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Seamless Photo Sharing',
      description: 'High-speed photo delivery with cloud storage and intelligent gallery organization tools.',
      icon: ShareIcon,
      color: 'from-green-500 to-teal-500'
    },
    {
      title: 'Instant Communication',
      description: 'Real-time messaging with file sharing, typing indicators, and automated booking notifications.',
      icon: MessageSquareIcon,
      color: 'from-orange-500 to-red-500'
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-indigo-50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Why Choose Snapper?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of photographers and clients who trust Snapper for their photography needs
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
                Learn more <ArrowRightIcon className="w-4 h-4 ml-2" />
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
    <section className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
      
      {/* Background decoration */}
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
            ✨ The Future of Photography Booking
          </span>
        </motion.div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to Snapper
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          Connect with top photographers, manage bookings, and share memories seamlessly.
          Join thousands of happy customers today!
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
          <Link href="/register">
            <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg transform transition hover:-translate-y-0.5"
            >
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-full"
            >
              Sign In
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center">
          <div className="text-center ">
            <div className="text-3xl font-bold text-gray-900" style={{marginRight:"5vh"}}>1000+</div>
            <div className="text-gray-600" style={{marginRight:"4vh"}}>Photographers</div>
          </div >
          <div className="text-center " >
            <div className="text-3xl font-bold text-gray-900" style={{marginRight:"5vh"}}>50k+</div>
            <div className="text-gray-600" style={{marginRight:"5vh"}}>Happy Clients</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900" style={{marginRight:"5vh"}}>99%</div>
            <div className="text-gray-600" style={{marginRight:"5vh"}}>Satisfaction</div>
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
      name: "Sarah Johnson",
      role: "Professional Photographer",
      content: "Snapper has transformed how I manage my photography business. The booking system is seamless!"
    },
    {
      name: "Michael Chen",
      role: "Client",
      content: "Found an amazing photographer for my wedding through Snapper. The whole process was incredibly smooth."
    },
    {
      name: "Emma Davis",
      role: "Portrait Photographer",
      content: "The portfolio features and client communication tools are exactly what I needed for my business."
    }
  ];

  return (
    <section className="py-20 bg-indigo-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            What Our Users Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join our community of satisfied photographers and clients
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
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
    </main>
  );
}