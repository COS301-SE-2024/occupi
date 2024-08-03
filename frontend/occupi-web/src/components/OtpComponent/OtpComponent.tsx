import React, { useState, useRef } from 'react'

type OtpComponentProps = {
  setOtp: (otp: string[], validity: boolean) => void;
}

const OtpComponent = (props: OtpComponentProps) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [err, setError] = useState("");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;

    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError("");
      
      // Focus the next input
      if (value !== "" && index < 5) {
        inputsRef.current[index + 1]?.focus();
        props.setOtp(newOtp, false);
      }
      else if(value !== "" && index === 5){
        props.setOtp(newOtp, true);
      }
    }
    else{
      setError("Invalid OTP: Please Enter a Valid 6-digit OTP.");
      props.setOtp(otp, false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && otp[index] === "") {
      if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        props.setOtp(otp, false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      {err !== "" && <h5 className="text-text_col_red_salmon font-normal text-base mt-3 mb-1">{err}</h5>}
      <div className="flex space-x-2 md:space-x-4">
        {otp.map((data, index) => (
          <input
            key={index}
            role='textbox'
            type="text"
            maxLength={1}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            ref={(element) => inputsRef.current[index] = element}
            className={`
              w-[10vw] h-[10vw]
              min-w-[40px] min-h-[40px]
              max-w-[60px] max-h-[60px]
              rounded-[15px] bg-secondary
              p-[8px] mb-[10px] mt-6 text-center
              ${err !== "" ? "border-[2px] border-red_salmon" : ""}
            `}
          />
        ))}
      </div>
    </div>
  );
}

export default OtpComponent