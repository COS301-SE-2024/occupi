import { motion } from "framer-motion";
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <SectionWrapper>
      <motion.div
        className="custom-screen text-gray-300"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="max-w-xl mx-auto text-center" variants={itemVariants}>
          <h2 className="text-gray-50 text-3xl font-semibold sm:text-4xl">
            Take your office capacity to the next level
          </h2>
          <p className="mt-3">
            With Occupi's powerful features, you can easily predict and plan
            your office capacity. You can also analyze your office's occupancy
            and make data-driven decisions to improve your business.
          </p>
        </motion.div>
        <motion.div className="mt-12" variants={containerVariants}>
          <ul className="space-y-8 gap-x-6 sm:flex sm:space-y-0">
            {features.map((item, idx) => (
              <motion.li
                className="flex-1 flex flex-col justify-between border border-gray-800 rounded-2xl"
                key={idx}
                variants={itemVariants}
                style={{
                  background:
                    "radial-gradient(141.61% 141.61% at 29.14% -11.49%, rgba(203, 213, 225, 0.15) 0%, rgba(203, 213, 225, 0) 57.72%)",
                }}
              >
                <div className="p-8">
                  <h3 className="text-gray-50 text-xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-3 sm:text-sm md:text-base">{item.desc}</p>
                </div>
                <motion.div className="pl-8" variants={imageVariants}>
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
      </motion.div>
     {/* AI-powered predictions section */}
<motion.div
  className="custom-screen text-gray-300"
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  <motion.div className="max-w-xl mx-auto text-center" variants={itemVariants}>
    <h2 className="text-gray-50 text-3xl font-semibold sm:text-4xl mt-10">
      Make AI-powered predictions for office capacity
    </h2>
    <p className="mt-3 mb-10">
      By participating in Occupi, you're directly contributing to the
      growth of artificial intelligence. By continuously improving
      predictive accuracy, the Occupi system introduces a dynamic,
      data-driven approach to office capacity management, benefiting both
      daily users and office operations.
    </p>
  </motion.div>
</motion.div>

{/* Occupi Web Analytics section */}
<motion.div
  className="custom-screen text-gray-300"
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  <div className="flex flex-wrap">
    <motion.div className="w-full md:w-1/2 px-4" variants={itemVariants}>
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-gray-50 text-3xl font-semibold sm:text-4xl mt-10">
          Use Occupi Web for your Analytics.
        </h2>
        <p className="mt-3">
          It offers real-time capacity status to employees and visitors,
          and detailed future occupancy predictions to office managers and
          owners, enabling optimized space usage and improved efficiency.
        </p>
      </div>
    </motion.div>
    <motion.div className="pl-8 mt-10" variants={imageVariants}>
      <Image
        src={Frame8}
        alt="Occupi App Screenshot"
        width={550}
        height={100}
        className="rounded-lg shadow-lg"
      />
    </motion.div>
  </div>
</motion.div>

{/* Occupi Desktop section */}
<motion.div
  className="custom-screen text-gray-300"
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  <div className="flex flex-wrap">
    <motion.div className="pl-8" variants={imageVariants}>
      <Image
        src={Frame6}
        alt="Occupi App Screenshot"
        width={550}
        height={100}
        className="rounded-lg shadow-lg"
      />
    </motion.div>
    <motion.div className="w-full md:w-1/2 px-4" variants={itemVariants}>
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-gray-50 text-3xl font-semibold sm:text-4xl mt-10">
          Use Occupi Desktop for more detailed prediction output.
        </h2>
        <p className="mt-3 ">
          Leveraging historical data and real-time inputs, the system
          helps office managers make informed decisions about space
          utilization, enhancing both immediate and long-term planning.
        </p>
      </div>
    </motion.div>
  </div>
</motion.div>

{/* Who are we section */}
<motion.div
  className="custom-screen text-gray-300"
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  <div className="flex flex-wrap">
    <motion.div className="w-full md:w-1/2 px-4" variants={itemVariants}>
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-gray-50 text-3xl font-semibold sm:text-4xl mt-10">
          Who are we?
        </h2>
        <p className="pl-8 mt-12">
          Y2Kode is a team of driven individuals with a passion for
          technology and a commitment to excellence. We are excited about
          the idea behind the Office Capacity Predictor and appreciate the
          freedom to infuse it with our unique Y2Kode twist.
        </p>
      </div>
    </motion.div>
    <motion.div className="pl-8" variants={imageVariants}>
      <Image
        src={Frame5}
        alt="Occupi App Screenshot"
        width={550}
        height={100}
        className="rounded-lg shadow-lg"
      />
    </motion.div>
  </div>
</motion.div>

{/* Occupi system description section */}
<motion.div
  className="custom-screen text-gray-300"
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  <motion.div className="max-w-xl mx-auto text-center" variants={itemVariants}>
    <h2 className="text-gray-50 text-3xl font-semibold sm:text-4xl mt-10">
      The Occupi Office Capacity Prediction system revolutionizes office
      space management by utilizing advanced machine learning algorithms
      and predictive models.
    </h2>
    <p className="mt-3 mt-12">
      As Y2Kode, we have developed this innovative solution for mobile for
      everyday office users, as well as a web application, and a desktop
      application for providing managerial services and delivering more
      detailed predictive outputs.
    </p>
    <motion.div className="pl-8" variants={imageVariants}>
      <Image
        src={Frame7}
        alt="Occupi App Screenshot"
        width={550}
        height={100}
        className="rounded-lg shadow-lg mt-10"
      />
    </motion.div>
  </motion.div>
</motion.div>

{/* App store links section */}
<motion.div
  className="custom-screen text-gray-300"
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  <motion.div className="max-w-xl mx-auto text-center" variants={itemVariants}>
    <motion.div className="w-full mt-20" variants={imageVariants}>
      <Image
        src={Frame3}
        alt="Occupi App Screenshot"
        width={850}
        height={100}
        className="w-full rounded-lg shadow-lg"
      />
    </motion.div>
    <motion.div className="flex justify-center items-center mt-6 space-x-4 ml-20" variants={containerVariants}>
      {[
        { src: PlayStore, href: "https://play.google.com/store", alt: "Google Play Store" },
        { src: AppleStore, href: "https://www.apple.com/app-store/", alt: "Apple App Store" },
        { src: WindowStore, href: "https://www.microsoft.com/store/apps", alt: "Microsoft Store" }
      ].map((store, index) => (
        <motion.div key={index} variants={itemVariants}>
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
</motion.div>
    </SectionWrapper>
  );
};

export default VisualFeatures;