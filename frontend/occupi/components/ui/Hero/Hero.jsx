import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import GradientWrapper from "@/components/GradientWrapper";
import Image from "next/image";
import HeroImg from "@/public/images/Group.svg";
import LayoutEffect from "@/components/LayoutEffect";

const AnimatedText = () => {
    const [index, setIndex] = useState(0);
    const words = ["", "Predict", "Plan", "Perfect"];
    const [showFull, setShowFull] = useState(false);

    useEffect(() => {
        if (index < words.length) {
            const timer = setTimeout(() => setIndex(index + 1), 1000);
            return () => clearTimeout(timer);
        } else if (!showFull) {
            const timer = setTimeout(() => setShowFull(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [index, showFull]);

    return (
        <div className="h-8">
            <AnimatePresence mode="wait">
                {!showFull ? (
                    <motion.span
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="text-xl text-white"
                    >
                        {words[index % words.length]}
                    </motion.span>
                ) : (
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-xl text-white"
                    >
                        Predict. Plan. Perfect.
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
};

const Hero = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delay: 0.3,
                duration: 1,
                when: "beforeChildren",
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    const buttonVariants = {
        hover: { scale: 1.05, transition: { duration: 0.2 } },
        tap: { scale: 0.95, transition: { duration: 0.1 } }
    };

    const imageVariants = {
        hidden: { opacity: 0, x: 100 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    return (
        <section>
            <div className="custom-screen py-28">
                <LayoutEffect
                    className="duration-1000 delay-300"
                    isInviewState={{
                        trueState: "opacity-1",
                        falseState: "opacity-0"
                    }}
                >
                    <motion.div
                        className="flex flex-col md:flex-row items-center justify-between"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <GradientWrapper wrapperClassName="max-w-3xl h-[250px] top-12 inset-0 sm:h-[300px] lg:h-[650px]">
                            <motion.div className="md:w-1/2 md:pr-8 mb-8 md:mb-0 md:ml-20">
                                <motion.h1
                                    variants={itemVariants}
                                    className="text-4xl font-bold text-white mb-4 sm:text-5xl"
                                >
                                    Analyse and Predict your office capacity
                                </motion.h1>
                                <AnimatedText />
                                <motion.p
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    className="inline-block bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors cursor-pointer mt-6"
                                >
                                    Get Access →
                                </motion.p>
                            </motion.div>
                        </GradientWrapper>
                        
                        <motion.div
                            className="md:w-1/2"
                            variants={imageVariants}
                        >
                            <Image
                                src={HeroImg}
                                alt="Occupi App Screenshot"
                                width={350}
                                height={100}
                                className="rounded-lg shadow-lg"
                            />
                        </motion.div>
                    </motion.div>
                </LayoutEffect>
            </div>
        </section>
    );
};

export default Hero;
