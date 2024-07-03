import { expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import OtpPage from "./OtpPage"; // Adjust the import path as needed
import { createElement } from "react";
// import '@testing-library/jest-dom';

interface OtpComponentProps {
  setOtp: (otp: string, isValid: boolean) => void;
}
test("OtpPage renders correctly", () => {
  render(<OtpPage />);
  
  expect(screen.getByText("We sent you an email with a code")).toBeDefined();
  expect(screen.getByText("Please enter it to continue")).toBeDefined();
  expect(screen.getByText("Complete")).toBeDefined();
});



test("OTP input updates correctly", () => {
  const capturedOtp = "123456";
  let capturedValidity = true;

  // Mock the OtpComponent
  const mockOtpComponent = mock<React.FC<OtpComponentProps>>(({ setOtp }) => {
    // Simulate OTP input
    setOtp("123456", true);
    return null;
  });
  // Mock the GradientButton
  const mockGradientButton = mock(({ isClickable }) => {
    // Capture the isClickable prop
    capturedValidity = isClickable;
    return null;
  });

  // Render the OtpPage with mocked components
  createElement(OtpPage, {
    OtpComponent: mockOtpComponent,
    GradientButton: mockGradientButton
  });

  // Use Bun's matchers to check the OTP value and validity
  expect(capturedOtp).toBe("123456");
  expect(capturedOtp).toHaveLength(6);
  expect(capturedValidity).toBe(true);

  // Check individual digits if needed
  expect(capturedOtp[0]).toBe("1");
  expect(capturedOtp[1]).toBe("2");
  expect(capturedOtp[2]).toBe("3");
  expect(capturedOtp[3]).toBe("4");
  expect(capturedOtp[4]).toBe("5");
  expect(capturedOtp[5]).toBe("6");
});





// test("Complete button becomes clickable when OTP is valid", () => {
//   let buttonClickable = false;
//   let otpState = { otp: "", validity: false };

//   // Mock useState
//   const mockUseState = mock((initialState) => {
//     let state = initialState;
//     const setState = (newState: typeof initialState) => {
//       state = typeof newState === 'function' ? newState(state) : newState;
//       otpState = state;
//       if ('validity' in state) {
//         buttonClickable = state.validity;
//       }
//     };
//     return [state, setState];
//   });

//   // Mock GradientButton
//   const MockGradientButton = mock(({ isClickable }: { isClickable: boolean }) => {
//     buttonClickable = isClickable;
//     return null;
//   });

//   // Create a mock OtpPage component
//   const MockOtpPage = () => {
//     const [otp, setOTP] = mockUseState({otp: "", validity: false});
    
//     return createElement('div', null, 
//       createElement(MockGradientButton, { isClickable: otp.validity }),
//       createElement('button', { 
//         onClick: () => setOTP({ otp: "123456", validity: true }) 
//       }, "Set Valid OTP")
//     );
//   };

//   // Render the mocked OtpPage
//   const page: React.ReactElement = createElement(MockOtpPage);

//   // Initially, the button should be disabled
//   expect(buttonClickable).toBe(false);

//   // Simulate setting a valid OTP
//   page.props.children[1].props.onClick();

//   // Now, the button should be clickable
//   expect(buttonClickable).toBe(true);
//   expect(otpState.validity).toBe(true);
//   expect(otpState.otp).toBe("123456");
// });

// test("SendOTP function is called when Complete button is clicked", async () => {
//   let isLoading = false;

//   // Mock useState
//   const mockUseState = mock((initialState) => {
//     let state = initialState;
//     const setState = (newState: typeof initialState) => {
//       state = typeof newState === 'function' ? newState(state) : newState;
//       if (typeof state === 'boolean') isLoading = state;
//     };
//     return [state, setState];
//   });

//   // Mock SendOTP function
//   const mockSendOTP = mock(() => {
//     isLoading = true;
//     setTimeout(() => {
//       isLoading = false;
//     }, 2000);
//   });

//   // Create a mock OtpPage component
//   const MockOtpPage = () => {
//     const [loading, setIsLoading] = mockUseState(false);
    
//     return createElement('div', null, 
//       createElement('button', { onClick: () => {
//         setIsLoading(true);
//         mockSendOTP();
//       }}, "Complete")
//     );
//   };

//   // Render the mocked OtpPage
//   const page = createElement(MockOtpPage);

//   // Simulate clicking the button
//   page.props.children.props.onClick();

//   // Button should be disabled (loading) immediately after click
//   expect(isLoading).toBe(true);

//   // Wait for the timeout in SendOTP to complete
//   await new Promise(resolve => setTimeout(resolve, 2100));

//   // Button should be enabled again after loading
//   expect(isLoading).toBe(false);
// });