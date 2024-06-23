import React, { useState } from "react";
import { motion } from "framer-motion";
import { TopNav } from "@components/index";

const faqData = [
  {
    section: "Profile Page FAQs",
    questions: [
      {
        question: "How do I edit my profile information?",
        answer:
          "To edit your profile, go to the Profile page and tap the 'Edit' button. You can then modify your personal details, contact information, and preferences.",
      },
      {
        question: "Can I change my profile picture?",
        answer:
          "Yes, you can change your profile picture. On the Profile page, tap your current picture or the camera icon to upload a new photo or choose one from your device.",
      },
      {
        question: "Where can I adjust my notification settings?",
        answer:
          "Notification settings can be found in the Profile page under 'Settings' or 'Preferences'. Here you can customize what notifications you receive and how.",
      },
      {
        question: "How do I manage my account preferences?",
        answer:
          "Account preferences are located in the Profile section. Look for options like 'Account Settings' or 'Preferences' to adjust your account-related choices.",
      },
      {
        question: "Can I customize the app's appearance?",
        answer:
          "Yes, the app offers appearance customization. In the Profile or Settings section, look for 'Appearance' or 'Theme' options to change colors, dark/light mode, etc.",
      },
    ],
  },
  {
    section: "Book a Room FAQs",
    questions: [
      {
        question: "How do I search for available rooms?",
        answer:
          "Use the search bar on the Book a Room page. Enter your desired dates, location, and any specific requirements to see available options.",
      },
      {
        question: "Can I filter rooms by specific amenities?",
        answer:
          "Yes, you can use filters to narrow down rooms by amenities. Look for a filter option on the search results page to select specific features you need.",
      },
      {
        question: "What's the booking process?",
        answer:
          "Select your desired room, choose your dates, review the details and price, and then click 'Book Now'. Follow the prompts to complete your reservation.",
      },
      {
        question: "How far in advance can I book a room?",
        answer:
          "Booking windows vary, but typically you can book rooms up to 6-12 months in advance, depending on the property's policies.",
      },
      {
        question: "Is there a cancellation policy?",
        answer:
          "Yes, cancellation policies are specific to each booking. You can find the policy details on the room information page before confirming your reservation.",
      },
    ],
  },
  {
    section: "My Bookings FAQs",
    questions: [
      {
        question: "Where can I see all my current bookings?",
        answer:
          "All your current bookings are listed on the My Bookings page. You can access this from the main menu or dashboard.",
      },
      {
        question: "How do I modify an existing booking?",
        answer:
          "To modify a booking, find it in your My Bookings list and tap 'Modify' or 'Edit'. Follow the prompts to make changes, subject to availability and policy.",
      },
      {
        question: "Can I cancel a booking? If so, how?",
        answer:
          "Yes, you can cancel bookings from the My Bookings page. Find the booking you want to cancel and tap 'Cancel'. Be aware of any cancellation fees or policies.",
      },
      {
        question: "Is there a way to view my booking history?",
        answer:
          "Yes, your booking history should be available on the My Bookings page. Look for a 'History' or 'Past Bookings' tab to view previous reservations.",
      },
      {
        question: "How do I get a receipt for my booking?",
        answer:
          "Receipts are usually emailed to you after your stay. You can also find them in the My Bookings section - look for a 'Receipt' or 'Invoice' option for each booking.",
      },
    ],
  },
  {
    section: "Login/Signup FAQs",
    questions: [
      {
        question: "How do I create a new account?",
        answer:
          "On the login screen, look for a 'Sign Up' or 'Create Account' option. Fill in the required information and follow the prompts to set up your new account.",
      },
      {
        question: "What should I do if I forget my password?",
        answer:
          "On the login screen, tap 'Forgot Password'. Enter your email address, and we'll send you instructions to reset your password.",
      },
      {
        question: "Can I use social media accounts to sign up or log in?",
        answer:
          "Yes, we offer social media login options. Look for icons of supported platforms (like Facebook or Google) on the login/signup page to use these services.",
      },
      {
        question: "Is there a verification process for new accounts?",
        answer:
          "Yes, we usually send a verification email to confirm your email address. Some accounts may require additional verification steps for security.",
      },
      {
        question: "How secure is my login information?",
        answer:
          "We use industry-standard encryption to protect your login information. We also recommend using a strong, unique password and enabling two-factor authentication if available.",
      },
    ],
  },
  {
    section: "Dashboard FAQs",
    questions: [
      {
        question: "What information is displayed on my dashboard?",
        answer:
          "Your dashboard shows an overview of your account, including recent bookings, upcoming reservations, account statistics, and quick access to key features.",
      },
      {
        question: "How often is the dashboard data updated?",
        answer:
          "Dashboard data is typically updated in real-time or very frequently to provide the most current information about your account and bookings.",
      },
      {
        question: "Can I customize the dashboard layout?",
        answer:
          "Some elements of the dashboard may be customizable. Look for a 'Customize' or 'Edit Layout' option to arrange the information according to your preferences.",
      },
      {
        question: "How do I interpret the graphs and statistics shown?",
        answer:
          "Hover over or tap on graph elements for more detailed information. There may also be a 'Help' or 'Info' icon near each graph explaining what the data represents.",
      },
      {
        question: "Is there a way to export dashboard data?",
        answer:
          "Check for an 'Export' or 'Download' option on your dashboard. This feature, if available, allows you to save your data in various formats for personal record-keeping or analysis.",
      },
    ],
  },
];

const helpData = [
  {
    title: "Introduction",
    content:
      "This manual provides instructions for using the Office Occupancy Application, which helps monitor and predict office occupancy rates to optimize space usage.",
  },
  {
    title: "Getting Started",
    content:
      "This document covers the installation, configuration, and usage of the application, as well as troubleshooting common issues.",
  },
  {
    title: "Account Management",
    content:
      "Detailed instructions on signing up, logging in, and using platform authenticator for easier login.",
  },
  {
    title: "User Interface Overview",
    content:
      "An overview of the dashboard, navigation menu, and different sections of the application.",
  },
  {
    title: "Using the Application",
    content:
      "Steps for viewing occupancy data, generating reports, and configuring settings.",
  },
  {
    title: "Glossary",
    content:
      "Definitions of key terms such as occupancy rate, predictive analysis, and dashboard.",
  },
  {
    title: "Appendix",
    content:
      "Contact information for support and version history of the application.",
  },
];

const FaqItem = ({ faq }: { faq: { question: string; answer: string } }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <motion.div
        layout
        initial={{ borderRadius: 10 }}
        className="mb-4 p-4 rounded-lg text-text_col bg-secondary shadow"
        onClick={() => setIsOpen(!isOpen)}
      >
        <motion.h2 layout="position" className="text-xl  font-semibold">
          {faq.question}
        </motion.h2>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <p className="mt-2 text-text_col" >{faq.answer}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const HelpItem = ({ help }: { help: { title: string; content: string } }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      layout
      initial={{ borderRadius: 10 }}
      className="mb-4 text-text_col_alt p-4  rounded-lg bg-secondary shadow"
      onClick={() => setIsOpen(!isOpen)}
    >
      <motion.h2 layout="position" className="text-xl text-text_col font-semibold">
        {help.title}
      </motion.h2>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p className="mt-2 text-text_col">{help.content}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

const Faq = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredFaqData = faqData.map((section) => ({
    ...section,
    questions: section.questions.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  return (
    <div className="w-full overflow-auto">
      <TopNav
        mainComponent={
          <div className="text-text_col font-semibold text-2xl ml-5">
            Help
            <span className="block text-sm opacity-65 text-text_col_secondary_alt">
              Get Help by clicking on a tab or searching
            </span>
          </div>
        }
        searchQuery={searchQuery}
        onChange={handleInputChange}
      />

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Help / FAQ</h1>

        <section className="mb-12 text-text_col_alt">
          <h2 className="text-2xl font-bold mb-4 text-text_col">FAQs</h2>
          {filteredFaqData.map(
            (faqSection, index) =>
              faqSection.questions.length > 0 && (
                <div key={index}>
                  <h3 className="text-xl font-semibold mb-2 text-text_col_secondary_alt">
                    {faqSection.section}
                  </h3>
                  {faqSection.questions.map((faq, idx) => (
                    <FaqItem key={idx} faq={faq} />
                  ))}
                </div>
              )
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Help</h2>
          {helpData.map((help, index) => (
            <HelpItem key={index} help={help} />
          ))}
        </section>
      </div>
    </div>
  );
};

export default Faq;
