import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "AuthService";
import { useUser } from "userStore"; // Assuming this is your user context or global state

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { userDetails } = useUser(); // Retrieve userDetails from global state
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!userDetails?.email) {
        setIsAuthenticated(false);
        navigate("/");
        return;
      }

      try {
        await AuthService.getUserDetails(userDetails.email); // Pass the stored email here
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        navigate("/");
      }
    };

    checkAuthentication();
  }, [navigate, userDetails]);

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
