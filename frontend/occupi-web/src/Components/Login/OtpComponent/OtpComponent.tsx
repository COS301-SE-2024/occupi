import React,{useState} from 'react'
import './OtpComponent.css'

const OtpComponent: React.FC  = () => {
  
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const value = e.target.value;
      if (/^[0-9]$/.test(value) || value === '') {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
  
        // Focus next input if current input is filled
        if (value && index < 5) {
          const nextSibling = document.getElementById(`otp${index + 2}`);
          if (nextSibling) {
            nextSibling.focus();
          }
        }
      }
    };
  
    return (
      <div className="otp-container">
        <label htmlFor="otp1" className="otp-label">Enter OTP:</label>
        <div className="otp-inputs">
          {otp.map((value, index) => (
            <input
              key={index}
              type="text"
              id={`otp${index + 1}`}
              maxLength={1}
              className="otp-input"
              value={value}
              onChange={(e) => handleChange(e, index)}
            />
          ))}
        </div>
      </div>
    );
  
}

export default OtpComponent
