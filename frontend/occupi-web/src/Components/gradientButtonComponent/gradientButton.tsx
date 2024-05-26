import React from 'react'
import './gradientButton.css'

interface GradientButtonProps {
    buttonText: string;
  }

  const GradientButton: React.FC<GradientButtonProps> = ({ buttonText }) => {
    return (
      <div className="box">
        <button className="login-button">
          <div className="text-wrapper-9">{buttonText}</div>
        </button>
      </div>
    );
  };
  
  export default GradientButton;