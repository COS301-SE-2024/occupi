import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "AuthService";
import { useUser } from "userStore"; // Assuming this is your user context or global state

interface ProtectedRouteProps {
  authRoutes: ReactNode;
  unAuthRoutes: ReactNode;
}

const ProtectedRoute = (props: ProtectedRouteProps) => {
  const { userDetails, setUserDetails } = useUser(); // Retrieve userDetails from global state
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      if (userDetails === null) {
        const res = await AuthService.pingAuth();
        if (res.status === 200 && res.message === "pong -> I am alive and kicking and you are auth'd") {
          const userDeets = await AuthService.getUserDetails();
          setUserDetails(userDeets);
        }
      }
    };

    checkAuthentication();
  }, [navigate]);

  return userDetails ? props.authRoutes : props.unAuthRoutes;
};

export default ProtectedRoute;
