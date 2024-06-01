import React from 'react'
import { motion } from 'framer-motion';

interface GradientButtonProps {
  Text: string;
  isClickable: boolean;
  clickEvent: () => void;
}

  const GradientButton: React.FC<GradientButtonProps> = (props: GradientButtonProps) => {

    return (
      <motion.div className={"w-full flex h-[50px] justify-center items-center text-text_col_tertiary " +
      "shadow-[0_9px_30px_7px_rgba(0,0,0,0.1)] rounded-[20px] " +
      "bg-gradient-to-r from-[#614DC8] via-[#86EBCC] via-[33.98%] to-[#EEF060] to-[105.07%] " +
      ( props.isClickable ? "" : " opacity-40 cursor-pointer ")}
      whileHover={props.isClickable ? {scale: 1.01} : {}}
      whileTap={props.isClickable ? {scale: 0.99} : {}}>
        {props.Text}
      </motion.div>
    );
  };
  
  export default GradientButton;