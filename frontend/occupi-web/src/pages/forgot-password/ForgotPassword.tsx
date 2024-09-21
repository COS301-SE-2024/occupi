import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OccupiLogo, login_image } from "@assets/index";
import { GradientButton, OccupiLoader, InputBox } from "@components/index";
import AuthService from "AuthService";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<{
    email: string,
    valid_email: boolean
  }>({ email: "", valid_email: false });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function sendResetEmail() {
    setIsLoading(true);
    setError("");

    try{
        const response = await AuthService.sendResetEmail(form.email);
    
        if (response.message.includes('check your email for an otp')) {
            navigate("/reset-password", { state: { email: form.email } });
            setIsLoading(false);
            return;
        }
        setIsLoading(false);
        setError("An unexpected error occurred");
    } catch (error) {
        console.error("Login error:", error);
        if (typeof error === 'object' && error !== null && 'message' in error) {
            setError(error.message as string);
        } else {
            setError("An unexpected error occurred");
        }
        setIsLoading(false);
        return;
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
        <h2 className="text-text_col font-semibold text-3xl md:text-4xl lg:text-5xl text-center mb-4">Forgot your password?</h2>
        <h3 className="text-text_col font-extralight text-xl md:text-2xl text-center mb-6">
          Enter your email address below
        </h3>

        <InputBox
          type="email"
          placeholder="Enter your email address"
          label="Email Address"
          submitValue={(val, validity) => {
            setForm({ ...form, email: val, valid_email: validity })
          }}
        />

        <div className="mt-5 w-full max-w-md">
          <GradientButton isLoading={isLoading} Text="Send OTP" isClickable={form.valid_email} clickEvent={sendResetEmail} />
        </div>

        {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
