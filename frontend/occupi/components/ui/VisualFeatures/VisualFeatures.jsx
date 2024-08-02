import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import SectionWrapper from "@/components/SectionWrapper";
import Feature1 from "@/public/images/Illustration-2.svg";
import Feature2 from "@/public/images/Illustration-1.svg";
import Frame6 from "@/public/images/Frame-6.svg";
import Frame7 from "@/public/images/Frame-7.svg";
import Frame8 from "@/public/images/Frame-4.svg";
import Frame3 from "@/public/images/Frame-3.svg";
import Frame5 from "@/public/images/Frame-5.svg";
import AppleStore from "@/public/images/app-store.svg";
import PlayStore from "@/public/images/googleplay.svg";
import WindowStore from "@/public/images/microsoft-store.svg";
import Image from "next/image";
import Link from "next/link";

const AnimatedSection = ({ children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.6, 
            ease: "easeOut",
            when: "beforeChildren",
            staggerChildren: 0.2
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

const VisualFeatures = () => {
  const features = [
    {
      title: "Historic office data analysis",
      desc: "Peek into your office's past occupancy data to make informed decisions about your office's future capacity.",
      img: Feature1,
    },
    {
      title: "What is Occupi and How Does it Work?",
      desc: "AI-powered predictions based off of historical data enable you to plan and perfect your organizations office management",
      img: Feature2,
    },
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 10,
        duration: 0.5 
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 10,
        duration: 0.5 
      },
    },
  };

  return (
    <SectionWrapper>
      <AnimatedSection>
        <motion.div className="max-w-xl mx-auto text-center" variants={itemVariants}>
          <motion.h2 
            className="text-gray-50 text-3xl font-semibold sm:text-4xl"
            variants={itemVariants}
          >
            Take your office capacity to the next level
          </motion.h2>
          <motion.p className="mt-3 text-gray-300" variants={itemVariants}>
            With Occupi's powerful features, you can easily predict and plan
            your office capacity. You can also analyze your office's occupancy
            and make data-driven decisions to improve your business.
          </motion.p>
        </motion.div>
      </AnimatedSection>

      <AnimatedSection>
        <motion.div className="mt-12">
          <ul className="space-y-8 gap-x-6 sm:flex sm:space-y-0">
            {features.map((item, idx) => (
              <motion.li
                className="flex-1 flex flex-col justify-between border border-gray-800 rounded-2xl overflow-hidden"
                key={idx}
                variants={itemVariants}
                whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
                style={{
                  background:
                    "radial-gradient(141.61% 141.61% at 29.14% -11.49%, rgba(203, 213, 225, 0.15) 0%, rgba(203, 213, 225, 0) 57.72%)",
                }}
              >
                <motion.div 
                  className="p-8"
                  variants={itemVariants}
                >
                  <motion.h3 
                    className="text-gray-50 text-xl font-semibold"
                    variants={itemVariants}
                  >
                    {item.title}
                  </motion.h3>
                  <motion.p 
                    className="mt-3 sm:text-sm md:text-base text-gray-300"
                    variants={itemVariants}
                  >
                    {item.desc}
                  </motion.p>
                </motion.div>
                <motion.div 
                  className="pl-8" 
                  variants={imageVariants}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Image
                    src={item.img}
                    className="w-full ml-auto"
                    alt={item.title}
                  />
                </motion.div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </AnimatedSection>

      <AnimatedSection>
        <motion.div className="max-w-xl mx-auto text-center mt-20" variants={itemVariants}>
          <motion.h2 
            className="text-gray-50 text-3xl font-semibold sm:text-4xl"
            variants={itemVariants}
          >
            Make AI-powered predictions for office capacity
          </motion.h2>
          <motion.p 
            className="mt-3 mb-10 text-gray-300"
            variants={itemVariants}
          >
            By participating in Occupi, you're directly contributing to the
            growth of artificial intelligence. By continuously improving
            predictive accuracy, the Occupi system introduces a dynamic,
            data-driven approach to office capacity management, benefiting both
            daily users and office operations.
          </motion.p>
        </motion.div>
      </AnimatedSection>

      <AnimatedSection>
        <div className="flex flex-wrap items-center">
          <motion.div className="w-full md:w-1/2 px-4" variants={itemVariants}>
            <div className="max-w-xl mx-auto text-center">
              <motion.h2 
                className="text-gray-50 text-3xl font-semibold sm:text-4xl"
                variants={itemVariants}
              >
                Use Occupi Web for your Analytics.
              </motion.h2>
              <motion.p 
                className="mt-3 text-gray-300"
                variants={itemVariants}
              >
                It offers real-time capacity status to employees and visitors,
                and detailed future occupancy predictions to office managers and
                owners, enabling optimized space usage and improved efficiency.
              </motion.p>
            </div>
          </motion.div>
          <motion.div 
            className="w-full md:w-1/2 pl-8 mt-10 md:mt-0" 
            variants={imageVariants}
            whileHover={{ scale: 1.05, rotate: 2 }}
          >
            <Image
              src={Frame8}
              alt="Occupi App Screenshot"
              width={550}
              height={100}
              className="rounded-lg shadow-lg"
            />
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Add more AnimatedSection components for other parts of your content */}

      <AnimatedSection>
        <motion.div className="max-w-xl mx-auto text-center mt-20" variants={itemVariants}>
          <motion.div 
            className="w-full" 
            variants={imageVariants}
            whileHover={{ scale: 1.05, rotate: 1 }}
          >
            <Image
              src={Frame3}
              alt="Occupi App Screenshot"
              width={850}
              height={100}
              className="w-full rounded-lg shadow-lg"
            />
          </motion.div>
          <motion.div className="flex justify-center items-center mt-6 space-x-4">
            {[
              { src: PlayStore, href: "https://play.google.com/store", alt: "Google Play Store" },
              { src: AppleStore, href: "https://www.apple.com/app-store/", alt: "Apple App Store" },
              { src: WindowStore, href: "https://www.microsoft.com/store/apps", alt: "Microsoft Store" }
            ].map((store, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={store.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={store.src}
                    alt={store.alt}
                    width={335}
                    height={40}
                    className="cursor-pointer"
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </AnimatedSection>
    </SectionWrapper>
  );
};

export default VisualFeatures;