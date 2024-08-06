import { useState } from "react";
import { loginpng, OccupiLogo } from "@assets/index";
import { Checkbox, GradientButton, InputBox } from "@components/index";
import { useNavigate } from "react-router-dom";
import { registerCredential, authenticateWithCredential } from './WebAuthn';

const LoginForm = (): JSX.Element => {
  const navigate = useNavigate();

  const [form, setForm] = useState<{
    email: string,
    password: string,
    valid_email: boolean,
    valid_password: boolean
  }>({ email: "", password: "", valid_email: false, valid_password: false });
  const [isloading, setIsLoading] = useState<boolean>(false);

  const handleWebAuthnRegistration = async () => {
    try {
      setIsLoading(true);
      const credential = await registerCredential();
      console.log('Credential registered:', credential);
      setIsLoading(false);
      // Handle success (e.g., show success message, redirect)
    } catch (error) {
      console.error('Error registering credential:', error);
      setIsLoading(false);
      // Handle error (e.g., show error message)
    }
  };

  const handleWebAuthnAuthentication = async () => {
    try {
      setIsLoading(true);
      const assertion = await authenticateWithCredential();
      if (assertion) {
        console.log('Authentication successful:', assertion);
        navigate("/dashboard/overview");
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error authenticating with credential:', error);
      setIsLoading(false);
      // Handle error (e.g., show error message)
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center items-center min-h-screen p-4">
      <div className="w-full lg:w-1/2 flex justify-center items-center mb-8 lg:mb-0 p-4">
  <div className="w-full max-w-md aspect-square">
    <img className="w-full h-full object-contain" src={loginpng} alt="welcomes" />
  </div>
</div>
      <div className="w-full lg:w-1/2 max-w-md px-4 flex flex-col items-center">
        <div className="w-24 h-24 mb-6">
          <OccupiLogo />
        </div>
        <h2 className="text-text_col font-semibold text-3xl lg:text-5xl mb-2 text-center">Welcome back to Occupi.</h2>
        <h3 className="text-text_col font-extralight text-xl lg:text-2xl mb-6 text-center">Predict. Plan. Perfect</h3>

        <InputBox
          type="email"
          placeholder="Enter your email address"
          label="Email Address"
          submitValue={(val, validity) => {
            setForm({ ...form, email: val, valid_email: validity })
          }}
        />
        <InputBox
          type="password"
          placeholder="Enter your password"
          label="Password"
          submitValue={(val, validity) => {
            setForm({ ...form, password: val, valid_password: validity })
          }}
        />

        <div className="w-full flex flex-col sm:flex-row justify-between items-center mt-5 space-y-2 sm:space-y-0">
          <div className="flex items-center">
            <Checkbox id="rememberMeCheckbox" />
            <p className="text-text_col_green_leaf cursor-pointer ml-2">Remember me</p>
          </div>
          <p className="text-text_col_green_leaf cursor-pointer">Forgot Password?</p>
        </div>
        
        <div className="mt-5 w-full">
          <GradientButton isLoading={isloading} Text="Auth" isClickable={form.valid_email && form.valid_password} clickEvent={handleWebAuthnAuthentication}/>
        </div>
        <div className="mt-5 w-full">
          <GradientButton isLoading={isloading} Text="Register" isClickable={form.valid_email && form.valid_password} clickEvent={handleWebAuthnRegistration}/>
        </div>

        <div className="flex items-center justify-center mt-5 mb-5">
          <p className="text-text_col">New to occupi?</p>
          <p className="ml-2 text-text_col_green_leaf cursor-pointer">Learn more</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;