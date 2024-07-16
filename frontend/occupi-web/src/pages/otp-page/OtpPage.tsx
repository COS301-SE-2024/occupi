// OtpPage.tsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OccupiLogo, login_image } from "@assets/index";
import { GradientButton, OtpComponent } from "@components/index";
import AuthService from "AuthService";
import { useUser } from "UserContext";

const OtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUserDetails } = useUser();

  const [email, setEmail] = useState<string>("");
  const [otp, setOTP] = useState<{ otp: string, validity: boolean }>({ otp: "", validity: false });
  const [isloading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const state = location.state as { email?: string } | null;
    if (state && state.email) {
      setEmail(state.email);
    } else {
      setError("Email not provided. Please start the login process again.");
      // Optionally, redirect to login page after a short delay
      // setTimeout(() => navigate('/login'), 3000);
    }
  }, [location.state, navigate]);

  async function verifyOTP() {
    if (!email) {
      setError("Email not available. Please start the login process again.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await AuthService.verifyOtpLogin(email, otp.otp.replace(/,/g, ""));
      console.log("OTP verification response:", response);
      
      // Uncomment these lines if you want to fetch and set user details
      // const userDetails = await AuthService.getUserDetails(email);
      // setUserDetails(userDetails);

      navigate("/dashboard/overview");
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("OTP verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row justify-center w-screen h-screen items-center p-4">
      <div className="w-full md:w-[60vw] h-auto md:h-[40vw] flex justify-center items-center mb-8 md:mb-0">
        <div className="w-full md:w-[70vw] h-auto md:h-[35vw]">
          <img className="w-full h-full object-cover" src={login_image} alt="welcomes" />
        </div>
      </div>
      <div className="w-full md:w-[30vw] md:ml-10 md:mr-3 flex flex-col items-center px-4">
        <div className="w-[30vw] max-w-[150px] h-auto aspect-square mb-6">
          <OccupiLogo />
        </div>
        <h2 className="text-text_col font-semibold text-3xl md:text-4xl lg:text-5xl text-center mb-4">We sent you an email with a code</h2>
        <h3 className="text-text_col font-extralight text-xl md:text-2xl text-center mb-6">
          {email ? `Please enter it to continue (${email})` : "Please enter it to continue"}
        </h3>

        <OtpComponent setOtp={(otp_val: string[], validity: boolean) => {
          setOTP({ ...otp, otp: otp_val.join(""), validity: validity });
        }} />

        <div className="mt-5 w-full max-w-md">
          <GradientButton isLoading={isloading} Text="Complete" isClickable={otp.validity && !!email} clickEvent={verifyOTP} />
        </div>

        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default OtpPage;