import { motion } from "framer-motion";
import Link from "next/link";
import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <motion.footer
      className="bg-gray-900 text-white py-12"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold mb-4">About Occupi</h3>
            <p className="text-gray-400">
              Occupi is an innovative office capacity management solution,
              leveraging AI to optimize workspace utilization and enhance
              productivity.
            </p>
          </motion.div>
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="../FAQs/FAQs.jsx" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <motion.a
                href="https://twitter.com/occupi"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTwitter className="text-2xl text-gray-400 hover:text-white transition-colors" />
              </motion.a>
              <motion.a
                href="https://linkedin.com/company/occupi"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaLinkedin className="text-2xl text-gray-400 hover:text-white transition-colors" />
              </motion.a>
              <motion.a
                href="https://github.com/occupi"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaGithub className="text-2xl text-gray-400 hover:text-white transition-colors" />
              </motion.a>
            </div>
          </motion.div>
        </div>
        <motion.div
          className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400"
          variants={itemVariants}
        >
          <p>&copy; {currentYear} Occupi. All rights reserved.</p>
          <p className="mt-2">
            <Link href="https://www.freeprivacypolicy.com/live/8f124563-97fc-43fa-bf37-7a82ba153ea3" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>{" "}
            |{" "}
            <Link href="https://www.freeprivacypolicy.com/live/af283d60-4488-40b7-8899-0744f2973ac9" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;