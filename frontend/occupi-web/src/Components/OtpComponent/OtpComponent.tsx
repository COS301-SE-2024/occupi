import React,{useState, useRef} from 'react'

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
      setError("Invalid OTP");
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
    <div>
      {err !== "" && <h5 className="text-text_col_red_salmon font-normal text-base mt-3 mb-1">{err}</h5>}
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={data}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(element) => inputsRef.current[index] = element}
          className={'h-[50px] w-[3.48vw] rounded-[15px] bg-secondary p-[8px]  mb-[5px] mt-6 ' +
            (index !== 5 ? " mr-[1.81vw]" : "") +
            (err !== "" ? " border-[2px] border-red_salmon " : "")
          }
        />
      ))}
    </div>
  );
}

export default OtpComponent
