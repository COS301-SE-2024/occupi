import React from 'react'
import './gradientButton.css'

interface GradientButtonProps {
  buttonText: string;
  containerClassName?: string;
  buttonClassName?: string; 
  }

  const GradientButton: React.FC<GradientButtonProps> = ({ buttonText ,containerClassName,buttonClassName}) => {
    return (
      <div className={`flex flex-col h-screen justify-end items-center pb-10 ${containerClassName}`}>
      <button className={`bg-colours-linear-gradient text-white font-semibold py-3 px-48 text-xl rounded-lg shadow-xl hover:opacity-90 transition-opacity duration-300 ${buttonClassName}`}>
        {buttonText}
      </button>
    </div>
    );
  };
  
  export default GradientButton;