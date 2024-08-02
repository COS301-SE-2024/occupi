import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionWrapper from "@/components/SectionWrapper";

const faqsList = [
    {
        q: "What is the Occupi Office Capacity Prediction system, and how does it work?",
        a: "Occupi is an AI-powered system that predicts office capacity and utilization. It uses historical data and real-time inputs to forecast office occupancy, helping organizations optimize their workspace usage and improve efficiency."
    },
    {
        q: "How does the system help with office space management?",
        a: "Occupi provides insights into space utilization, allowing managers to make data-driven decisions about office layout, meeting room allocation, and desk assignments. This helps reduce wasted space and improves overall office efficiency."
    },
    {
        q: "What kind of information does the system provide to employees and visitors?",
        a: "Employees and visitors can access real-time information about office occupancy, available desks, meeting room availability, and predicted busy periods. This helps them plan their office visits and collaborations more effectively."
    },
    {
        q: "Is the system easy to use, even for those without technical expertise?",
        a: "Yes, Occupi is designed with a user-friendly interface that's accessible to both tech-savvy and non-technical users. It provides intuitive dashboards and reports that are easy to understand and act upon."
    },
    {
        q: "How does the system ensure data security and privacy?",
        a: "Occupi employs industry-standard encryption, secure authentication methods, and regular security audits to protect user data. We also adhere to data protection regulations and provide options for data anonymization."
    },
    {
        q: "What machine learning algorithms and predictive models does the system utilize?",
        a: "Occupi uses a combination of time series analysis, regression models, and deep learning techniques. This includes algorithms like ARIMA, Random Forests, and LSTMs to capture both short-term and long-term occupancy patterns."
    },
    {
        q: "How does the system handle data analytics and visualization?",
        a: "Occupi provides comprehensive analytics through interactive dashboards and customizable reports. It uses modern data visualization libraries to present complex occupancy data in an easily digestible format."
    },
    {
        q: "Can the system be integrated with other data sources and APIs?",
        a: "Yes, Occupi offers robust API integration capabilities. It can connect with various data sources, including HR systems, access control systems, and IoT devices, to enhance its predictive capabilities and provide a more comprehensive view of office utilization."
    },
    {
        q: "How do I get started with using the Occupi Office Capacity Prediction system?",
        a: "Getting started is easy. Sign up for an account on our website, and our team will guide you through the setup process. This includes integrating with your existing systems, setting up user accounts, and customizing the system to your office's specific needs."
    },
    {
        q: "What kind of support and training are available for users?",
        a: "We offer comprehensive support including documentation, video tutorials, webinars, and a dedicated support team. We also provide personalized training sessions for office managers and system administrators to ensure they can make the most of Occupi's features."
    },
    {
        q: "How much does the system cost, and what are the pricing plans?",
        a: "Occupi offers flexible pricing plans based on the size of your organization and the features you need. We have plans suitable for small startups to large enterprises. Please contact our sales team for a customized quote tailored to your specific requirements."
    },
    {
        q: "How does the system handle edge cases and unexpected occupancy patterns?",
        a: "Occupi's AI models are designed to adapt to changing patterns and anomalies. The system continuously learns from new data, allowing it to adjust its predictions for special events, seasonal changes, or unexpected situations like public health emergencies."
    }
];

const FAQs = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <SectionWrapper id="faqs">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="custom-screen text-gray-300"
            >
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-xl text-center xl:mx-auto mb-12"
                >
                    <h2 className="text-gray-50 text-3xl font-extrabold sm:text-4xl mb-4">
                        Everything you need to know
                    </h2>
                    <p className="text-gray-400">
                        Here are the most common questions people ask about our service.
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid gap-6 sm:grid-cols-2"
                >
                    {faqsList.map((item, idx) => (
                        <FAQItem
                            key={idx}
                            item={item}
                            isOpen={openIndex === idx}
                            toggleOpen={() => toggleFAQ(idx)}
                        />
                    ))}
                </motion.div>
            </motion.div>
        </SectionWrapper>
    );
};

export default FAQs;