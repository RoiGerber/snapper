'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import { motion } from 'framer-motion';

const images = [
  { src: 'pictures/image1.jpg', alt: 'image1' },
  { src: 'pictures/image2.jpg', alt: 'image2' },
  { src: 'pictures/image3.jpg', alt: 'image3' },
  { src: 'pictures/image4.jpg', alt: 'image4' },
  { src: 'pictures/image5.jpg', alt: 'image5' },
  { src: 'pictures/image6.jpg', alt: 'image6' },
  { src: 'pictures/image7.jpg', alt: 'image1' },
  { src: 'pictures/image8.jpg', alt: 'image2' },
  { src: 'pictures/image9.jpg', alt: 'image3' },
  { src: 'pictures/image10.jpg', alt: 'image4' },
  { src: 'pictures/image11.jpg', alt: 'image5' },
  { src: 'pictures/image12.jpg', alt: 'image6' },
  { src: 'pictures/image13.jpg', alt: 'image1' },
  { src: 'pictures/image14.jpg', alt: 'image2' },
  { src: 'pictures/image15.jpg', alt: 'image3' },
  { src: 'pictures/image16.jpg', alt: 'image4' },
];

export default function Gallery() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-indigo-50" dir="rtl">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            הגלריה שלנו
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            צפו בתמונות מהאירועים האחרונים שלנו
          </p>
        </motion.div>

        {/* Carousel Section */}
        <div className="relative mb-16">
          <Swiper
            modules={[Navigation, Pagination, Thumbs]}
            spaceBetween={10}
            navigation
            pagination={{ clickable: true }}
            thumbs={{ swiper: thumbsSwiper }}
            className="rounded-xl shadow-lg overflow-hidden"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Thumbnail Carousel */}
          <div className="mt-8">
            <Swiper
              modules={[Thumbs]}
              spaceBetween={10}
              slidesPerView={4}
              watchSlidesProgress
              onSwiper={setThumbsSwiper}
              className="rounded-xl shadow-lg overflow-hidden"
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="relative h-24 cursor-pointer">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 hover:bg-opacity-0 transition duration-300" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Grid Gallery Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-xl shadow-lg cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-64 object-cover"
              />
            </motion.div>
          ))}
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div className="bg-white p-6 rounded-xl max-w-3xl w-full">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
