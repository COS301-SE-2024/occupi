import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "AuthService";
import { useUser } from "userStore"; // Assuming this is your user context or global state
import { Spinner } from "@nextui-org/react";

interface ProtectedRouteProps {
  authRoutes: ReactNode;
  unAuthRoutes: ReactNode;
}

const ProtectedRoute = (props: ProtectedRouteProps) => {
  const { userDetails, setUserDetails } = useUser(); // Retrieve userDetails from global state
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Loading state to show a spinner while checking authentication

  useEffect(() => {
    const checkAuthentication = async () => {
      try{
        if(userDetails === null){
          const res = await AuthService.pingAdmin();
          if (res.status === 200) {
            const userDeets = await AuthService.getUserDetails();
            setUserDetails(userDeets);
          } else {
            setUserDetails(null);
          }
        }
      } catch (error) {
        setUserDetails(null);
      }
      setLoading(false); // Set loading to false after the check is done
    };

    checkAuthentication();
  }, [navigate, userDetails, setUserDetails]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col justify-center items-center">
        <Spinner size="lg" />
        <p className="mt-2 text-text_col">Just a moment...</p>
      </div>
    )
  }

  return userDetails ? props.authRoutes : props.unAuthRoutes;
};

export default ProtectedRoute;
