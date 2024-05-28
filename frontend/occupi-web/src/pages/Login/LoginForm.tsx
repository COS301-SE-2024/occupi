import React, { useState } from "react";
// import { CheckSquareContained } from "../../assets/icons/CheckSquareContained ";
// import { EyeClosed1 } from "../../icons/EyeClosed1";
import "./style.css";
import loginImage from "../../assets/login.png"; // adjust the path as necessary
import { Checkbox } from "../../Components/ui/checkbox";
// import { useHistory } from "react-router-dom"; // Import useHistory
import GradientButton from "../../Components/gradientButtonComponent/gradientButton";

const LoginForm = (): JSX.Element => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  // const history = useHistory(); // Initialize useHistory

  const validateEmail = (email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6; // Example validation: password should be at least 6 characters
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    let valid = true;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!validatePassword(password)) {
      setPasswordError("Password should be at least 6 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (valid) {
      // Handle form submission
      console.log("Form is valid. Submitting...");
    }
  };
  const inputStyle = (hasError: boolean) => ({
    backgroundColor: "rgba(235, 235, 235, 1)",
    borderRadius: "15px",
    height: "65px",
    width: "450px",
    border: hasError ? "1px solid red" : "none",
    padding: "10px",
    fontSize: "16px",
  });

  const errorMessageStyle = {
    color: "red",
    fontSize: "14px",
    marginTop: "5px",
  };

  return (
    <div className="box">
      <div className="group">
        <div className="overlap">
          <img
            className="frame"
            alt="Frame"
            src="https://c.animaapp.com/Ac7JpPyQ/img/frame-6.svg"
          />
          <div className="div">
            <div className="text-wrapper">Welcome back to Occupi.</div>
            <div className="text-wrapper-2">Predict. Plan. Perfect</div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="group-2">
              <div className="overlap-group">
                <input
                  type="email"
                  style={inputStyle(!!emailError)}
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && (
                  <div style={errorMessageStyle}>{emailError}</div>
                )}
              </div>
            </div>
            <div className="group-3">
              <input
                type="password"
                style={inputStyle(!!passwordError)}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {passwordError && (
                <div style={errorMessageStyle}>{passwordError}</div>
              )}{" "}
            </div>
          </div>
          <div className="overlap-4 justify-between ">
            <div className="group-4 flex items-center ">
              <div className="text-black mr-2 ">Remember me</div>
              <Checkbox id="rememberMeCheckbox" />
            </div>
            <div className="text-green-600 ">Forgot Password?</div>
          </div>
          
          <GradientButton buttonText="Login" containerClassName="mt-auto" />

          <div className="flex items-center justify-center ">
            <p className="mr-4">New to occupi?</p>
            <div className="text-green-600">Learn more</div>{" "}
          </div>
        </form>
      </div>
      <div className="image-container">
        <img className="image" src={loginImage} alt="welcomes" />
      </div>
    </div>
  );
};

export default LoginForm;
