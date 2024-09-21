import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OccupiLogo, login_image } from "@assets/index";
import { GradientButton, OtpComponent, OccupiLoader, InputBox } from "@components/index";
import AuthService from "AuthService";
import { useUser } from "userStore";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUserDetails } = useUser();

  const [form, setForm] = useState<{ 
    email: string,
    otp: string, 
    password: string,
    passwordConfirm: string,
    valid_email: boolean,
    valid_otp: boolean,
    valid_password: boolean,
    valid_passwordConfirm: boolean
    }>({email: "",otp: "",password: "",passwordConfirm: "",valid_email: false,valid_otp: false,valid_password: false,valid_passwordConfirm: false});

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const state = location.state as { email?: string } | null;
    if (state && state.email) {
        setForm({ ...form, email: state.email });
    } else {
        navigate("/forgot-password");
    }
  }, [location.state, navigate]);

  async function verifyOTP() {
    if (!form.email) {
      setError("Email not available. Please start the login process again.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await AuthService.resetPassword(form.email, form.otp.replace(/,/g, ""), form.password, form.passwordConfirm);
      console.log("OTP verification response:", response);

      // Uncomment these lines if you want to fetch and set user details
      const userDetails = await AuthService.getUserDetails(form.email);
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
    <div className="flex flex-col md:flex-row justify-center w-screen h-screen items-center p-4">
      {isLoading && <OccupiLoader message="Please wait..." />}
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
          {form.email ? `Please enter it to continue (${form.email})` : "Please enter it to continue"}
        </h3>

        <OtpComponent setOtp={(otp_val: string[], validity: boolean) => { setForm({ ...form, otp: otp_val.join(""), valid_otp: validity })}} />

        <div className="h-0.5 bg-tertiary rounded-2xl my-4 w-full" />

        <InputBox
          type="password"
          placeholder="Enter your new password"
          label="New Password"
          submitValue={(val, validity) => {
            setForm({ ...form, password: val, valid_password: validity })
          }}
        />

        <InputBox
          type="password"
          placeholder="Confirm your new password"
          label="Confirm Password"
          submitValue={(val, validity) => {
            setForm({ ...form, passwordConfirm: val, valid_passwordConfirm: validity })
          }}
        />

        <div className="mb-[5px] mt-6"/>

          <GradientButton isLoading={isLoading} Text="Complete" isClickable={form.valid_email && form.valid_otp && form.valid_password && form.valid_passwordConfirm} clickEvent={verifyOTP} />

        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
