import { useState } from "react";
import {
  //loginpng, 
  OccupiLogo, login_image} from "@assets/index";
import {  GradientButton, OtpComponent } from "@components/index";

const OtpPage = () => {

  const [otp, setOTP] = useState<{
    otp: string,
    validity: boolean
  }>({otp: "", validity: false});
  const [isloading, setIsLoading] = useState<boolean>(false);

  function SendOTP() {
    setIsLoading(true);
    // login functionality should happen here, use axios if possible
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }

  return (
    <div className="flex justify-center w-screen h-screen items-center">
      <div className="w-[60vw] h-[40vw] flex justify-center items-center">
        <div className="w-[70vw] h-[35vw]">
          <img className="min-w-[100%] h-[100%] inline m-auto object-cover" src={login_image} alt="welcomes" />
        </div>
      </div>
        <div className="w-[30vw] ml-10 mr-3 flex flex-col items-center">
          <div className="w-[10vw] h-[10vw] mt-[1rem]">
            <OccupiLogo />
          </div>
          <h2 className="w-[30vw] text-text_col font-semibold text-5xl mt-2">We sent you an email with a code</h2>
          <h3 className="w-[30vw] text-text_col font-extralight text-2xl mt-4">Please enter it to continue</h3>

          <OtpComponent setOtp={(otp_val, validity) => {
            setOTP({ ... otp, otp : otp_val.toString()})
            setOTP({ ... otp, validity : validity})
          }}/>

          <div className="mt-5 w-full">
            <GradientButton isLoading={isloading} Text="Complete" isClickable={otp.validity} clickEvent={SendOTP}/>
          </div>
        </div>
    </div>
  );
};

export default OtpPage;
