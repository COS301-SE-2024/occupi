import React from "react";
import "./OtpPage.css";
import OtpComponent from "../../Components/OtpComponent/OtpComponent";
import loginImage from '../../assets/otp.png';
import GradientButton from "../../Components/gradientButtonComponent/gradientButton";

const OtpPage = () => {
  return (
    <div className="box">
      <div className="group">
        <div className="overlap">
          <img
            className="frame"
            alt="Frame"
            src="https://c.animaapp.com/Ac7JpPyQ/img/frame-6.svg"
          />
          <div className="div">
            <div className="text-wrapper">We sent you an email with a code</div>
            <div className="text-wrapper-2">Please enter the code below to continue</div>
          </div>
        </div>
        <div className="group-2">
            <OtpComponent />
        </div>
        
        <div className="button-container">
        <GradientButton buttonText="Verify"/>
        </div>

      </div>

      <div className='image-container'>
            <img className='image' src= {loginImage} alt="OTP" />
</div>
    </div>
  );
};

export default OtpPage;
