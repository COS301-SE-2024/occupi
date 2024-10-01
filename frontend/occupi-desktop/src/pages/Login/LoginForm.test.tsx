// import { expect, test, describe, mock } from "bun:test";
// import { createRoot } from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import LoginForm from "./LoginForm";
// import AuthService from "AuthService";
// import { UserProvider } from "UserContext";

// describe("LoginForm", () => {
//   test("renders without crashing", () => {
//     document.body.innerHTML = '<div id="root"></div>';
//     const rootElement = document.getElementById("root");
//     if (!rootElement) throw new Error("Root element not found");
    
//     const root = createRoot(rootElement);
//     root.render(
//       <BrowserRouter>
//         <UserProvider>
//           <LoginForm />
//         </UserProvider>
//       </BrowserRouter>
//     );
//     expect(document.body.innerHTML).toContain("Welcome back to Occupi.");
//   });

//   test("handles email input", () => {
//     document.body.innerHTML = '<div id="root"></div>';
//     const rootElement = document.getElementById("root");
//     if (!rootElement) throw new Error("Root element not found");
    
//     const root = createRoot(rootElement);
//     root.render(
//       <BrowserRouter>
//         <UserProvider>
//           <LoginForm />
//         </UserProvider>
//       </BrowserRouter>
//     );

//     const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement | null;
//     if (!emailInput) throw new Error('Email input not found');

//     emailInput.value = "test@example.com";
//     emailInput.dispatchEvent(new Event("input"));

//     expect(emailInput.value).toBe("test@example.com");
//   });

//   test("handles password input", () => {
//     document.body.innerHTML = '<div id="root"></div>';
//     const rootElement = document.getElementById("root");
//     if (!rootElement) throw new Error("Root element not found");
    
//     const root = createRoot(rootElement);
//     root.render(
//       <BrowserRouter>
//         <UserProvider>
//           <LoginForm />
//         </UserProvider>
//       </BrowserRouter>
//     );

//     const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement | null;
//     if (!passwordInput) throw new Error('Password input not found');

//     passwordInput.value = "password";
//     passwordInput.dispatchEvent(new Event("input"));

//     expect(passwordInput.value).toBe("password");
//   });

//   test("login functionality", async () => {
//     const mockLogin = mock(() => Promise.resolve({ message: "Login successful" }));
//     AuthService.login = mockLogin;

//     document.body.innerHTML = '<div id="root"></div>';
//     const rootElement = document.getElementById("root");
//     if (!rootElement) throw new Error("Root element not found");

//     const root = createRoot(rootElement);
//     root.render(
//       <BrowserRouter>
//         <UserProvider>
//           <LoginForm />
//         </UserProvider>
//       </BrowserRouter>
//     );

//     const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement | null;
//     const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement | null;
//     const loginButton = document.querySelector('button') as HTMLButtonElement | null;

//     if (!emailInput || !passwordInput || !loginButton) throw new Error('Form elements not found');

//     emailInput.value = "test@example.com";
//     emailInput.dispatchEvent(new Event("input"));

//     passwordInput.value = "password";
//     passwordInput.dispatchEvent(new Event("input"));

//     loginButton.click();

//     await new Promise(resolve => setTimeout(resolve, 0));

//     expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password");
//   });
// });
