import { useState } from "react";
import {loginpng, OccupiLogo} from "@assets/index";
import { Checkbox, GradientButton, InputBox } from "@components/index";
import { useNavigate} from "react-router-dom";
import { registerCredential, authenticateWithCredential } from './WebAuthn'; // Import WebAuthn functions

const LoginForm = (): JSX.Element => {
  const navigate = useNavigate();

  const [form, setForm] = useState<{
    email: string, 
    password: string, 
    valid_email: boolean, 
    valid_password: boolean
  }>({email: "", password: "", valid_email: false, valid_password: false});
  const [isloading, setIsLoading] = useState<boolean>(false);


  function Login() {
    setIsLoading(true);
    // login functionality should happen here, use axios if possible
  //  <Link to="/dashboard" ></Link> // navigate to OTP page on successful login
  
    setTimeout(() => {
      setIsLoading(false);
      navigate("/otp");
    }, 2000);
  }

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
        // Handle success (e.g., login successful, navigate to dashboard)
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
    <div className="flex justify-center w-screen h-screen items-center">
      <div className="w-[60vw] h-[40vw] flex justify-center items-center">
        <div className="w-[40vw] h-[40vw]">
          <img className="min-w-[100%] h-[100%] inline m-auto object-cover" src={loginpng} alt="welcomes" />
        </div>
      </div>
        <div className="w-[30vw] ml-10 mr-3 flex flex-col items-center">
          <div className="w-[10vw] h-[10vw] mt-[7rem]">
            <OccupiLogo />
          </div>
          <h2 className="w-[30vw] text-text_col font-semibold text-5xl mt-2">Welcome back to Occupi.</h2>
          <h3 className="w-[30vw] text-text_col font-extralight text-2xl mt-4">Predict. Plan. Perfect</h3>

          <InputBox
            type="email"
            placeholder="Enter your email address"
            label="Email Address"
            submitValue={(val, validity) => {
              setForm({ ... form, email : val})
              setForm({ ... form, valid_password: validity})
            }}
          />
          <InputBox
            type="password"
            placeholder="Enter your password"
            label="Password"
            submitValue={(val, validity) => {
              setForm({ ... form, email : val})
              setForm({ ... form, valid_email: validity})
            }}
          />

          <div className="w-full flex justify-between mt-5">
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