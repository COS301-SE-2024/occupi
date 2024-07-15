// OtpPage.tsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OccupiLogo, login_image } from "@assets/index";
import { GradientButton, OtpComponent } from "@components/index";
import AuthService from "AuthService";
import { useUser } from "UserContext";

const OtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUserDetails } = useUser();

  const { email } = location.state as { email: string };

  const [otp, setOTP] = useState<{ otp: string, validity: boolean }>({ otp: "", validity: false });
  const [isloading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function verifyOTP() {
    setIsLoading(true);
    setError("");
    try {
      const response = await AuthService.verifyOtpLogin(email, otp.otp.replace(/,/g, ""));
      console.log("OTP verification response:", response);
      
      const userDetails = await AuthService.getUserDetails(email);
      setUserDetails(userDetails);

      navigate("/dashboard/overview");
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("OTP verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

        <OtpComponent setOtp={(otp_val: string[], validity: boolean) => {
          setOTP({ ...otp, otp: otp_val.join(""), validity: validity });
        }} />

        <div className="mt-5 w-full">
          <GradientButton isLoading={isloading} Text="Complete" isClickable={otp.validity} clickEvent={verifyOTP} />
        </div>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default OtpPage;
