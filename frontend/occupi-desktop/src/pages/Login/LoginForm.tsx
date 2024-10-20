import { useState } from "react";
import { loginpng, OccupiLogo } from "@assets/index";
import { GradientButton, InputBox, OccupiLoader } from "@components/index";
import { useNavigate } from "react-router-dom";
import AuthService from "AuthService";
import { useUser } from "userStore";

const LoginForm = (): JSX.Element => {
  const navigate = useNavigate();
  const { setUserDetails } = useUser();

  const [form, setForm] = useState<{
    email: string,
    password: string,
    valid_email: boolean,
    valid_password: boolean
  }>({ email: "", password: "", valid_email: false, valid_password: false });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [requiresOtp, setRequiresOtp] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (form.email === "") {
      setError("Please fill in email field");
      setIsLoading(false);
      return;
    }

    if (form.password === "") {
      setError("Please fill in password field");
      setIsLoading(false);
      return;
    }

    try{
      const response = await AuthService.login(form.email, form.password);
      console.log("Login response:", response);
  
console.log("Login:", form.email, form.password);
      if (response.message.includes('check your email for an otp')) {
        setRequiresOtp(true);
        navigate("/otp", { state: { email: form.email } });

        setIsLoading(false);
        return;
      }
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
    
    try {
      setUserDetails({ email: form.email, name: "", dob: "", gender: "", employeeid: "", number: "", pronouns: "", avatarId: "", position: "", departmentNo: "" });
      const userDetails = await AuthService.getUserDetails(form.email);
      console.log("User details from API:", userDetails);

      setUserDetails(userDetails);
      console.log("UserDetails after setting:", userDetails);

      navigate("/dashboard");
    } catch (error) {
      console.error("Login or user details error:", error);
      if (typeof error === 'object' && error !== null && 'message' in error) {
        setError(error.message as string);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clickSubmit = () => { document.getElementById("LoginFormSubmitButton")?.click(); }

  return (
    <div className="flex flex-col lg:flex-row justify-center items-center min-h-screen p-4">
      {isLoading && <OccupiLoader message={requiresOtp ? "Redirecting to OTP page..." : "Logging you in..."} />}
      <div className="w-full lg:w-1/2 flex justify-center items-center mb-8 lg:mb-0 p-4">
        <div className="w-full max-w-md aspect-square">
          <img className="w-full h-full object-contain" src={loginpng} alt="welcomes" />
        </div>
      </div>
      <form className="w-full lg:w-1/2 max-w-md px-4 flex flex-col items-center" onSubmit={handleLogin}>
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
          <div className="flex items-center"/>
          <p className="text-text_col_green_leaf cursor-pointer" onClick={() => navigate("/forgot-password")}>Forgot Password?</p>
        </div>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <div className="mt-5 w-full">
          <GradientButton isLoading={isLoading} Text="Login" isClickable={form.valid_email} clickEvent={clickSubmit}/>
        </div>

        {/**This is a hidden button that is clicked when the user clicks the login button
         * This allows us to take advantage of password managers that automatically fill in the form
         * so don't mistakenly remove it thinking it's not needed
         */}
        <button type="submit" id="LoginFormSubmitButton" className="hidden"></button>

        <div className="flex items-center justify-center mt-5 mb-5">
          <p className="text-text_col">New to occupi?</p>
          <a className="ml-2 text-text_col_green_leaf cursor-pointer" href="https://occupi.tech" target="ref">
          Learn more</a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
