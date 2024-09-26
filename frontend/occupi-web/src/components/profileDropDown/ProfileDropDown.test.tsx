// import { expect, test, describe } from "bun:test";
// import { render } from "react-dom";
// import { BrowserRouter } from "react-router-dom";
// import ProfileDropdown from "./ProfileDropDown";
// import { createRoot } from "react-dom/client";


// describe("ProfileDropdown", () => {
//   test("renders without crashing", () => {
//     document.body.innerHTML = '<div id="root"></div>';
//     const root = document.getElementById("root");
//     render(
//       <BrowserRouter>
       
//           <ProfileDropdown isMinimized={false} />
        
//       </BrowserRouter>,
//       root
//     );
//     expect(document.body.innerHTML).toContain("occupi-admin");
//   });

//   test("displays user email", () => {
//     // const mockUserDetails = { email: "test@example.com" };
//     document.body.innerHTML = '<div id="root">test@example.com</div>';
//     const rootElement = document.getElementById("root");
//     const root = createRoot(rootElement!);
//     root.render(
//       <BrowserRouter>
       
//             <ProfileDropdown isMinimized={false} />
//       </BrowserRouter>
//     );
//     expect(document.body.innerHTML).toContain("test@example.com");
//   });
//   // test("logout functionality", async () => {
//   //   const mockLogout = mock(() => Promise.resolve());
//   //   AuthService.logout = mockLogout;

//   //   const mockSetUserDetails = mock(() => {});
//   //   const mockNavigate = mock(() => {});

//   //   document.body.innerHTML = '<div id="root"></div>';
//   //   const root = document.getElementById("root");
//   //   render(
//   //     <BrowserRouter>
       
//   //           <ProfileDropdown isMinimized={false} />
          
//   //     </BrowserRouter>,
//   //     root
//   //   );

//   //   // Simulate clicking the logout button
//   //   const logoutButton = root && getByTestId(root, 'logout') as HTMLButtonElement;
//   //   if (logoutButton) {
//   //     logoutButton.click();
//   //   }

//   //   // Wait for any asynchronous operations to complete
//   //   await new Promise(resolve => setTimeout(resolve, 0));

//   //   expect(mockLogout).toHaveBeenCalled();
//   //   expect(mockSetUserDetails).toHaveBeenCalledWith(null);
//   // });
// });
