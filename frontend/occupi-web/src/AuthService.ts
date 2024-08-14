import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const API_URL = "/auth"; // This will be proxied to https://dev.occupi.tech
const API_USER_URL = "/api"; // Adjust this if needed

interface PublicKeyCredential {
  id: string;
  rawId: ArrayBuffer;
  type: string;
  response: {
    attestationObject: ArrayBuffer;
    clientDataJSON: ArrayBuffer;
  };
}

interface PublicKeyAssertion {
  id: string;
  rawId: ArrayBuffer;
  type: string;
  response: {
    authenticatorData: ArrayBuffer;
    clientDataJSON: ArrayBuffer;
    signature: ArrayBuffer;
    userHandle: ArrayBuffer;
  };
}

// interface PublicKeyCredentialRequestOptions {
//   challenge: ArrayBuffer;
//   allowCredentials: Array<{
//     id: ArrayBuffer;
//     type: string;
//     transports?: string[];
//   }>;
//   // Add other properties as needed
// }

const AuthService = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/login-admin`, {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      }
      throw new Error("An unexpected error occurred");
    }
  },

  webauthnRegister: async (email: string) => {
    try {
      const response = await axios.post(`${API_URL}/register-admin-begin`, {
        email,
      });

      if (response.data.message === "Please check your email for an otp.") {
        return response.data;
      }

      response.data.data.options.publicKey.challenge = bufferDecode(
        response.data.data.options.publicKey.challenge
      );
      response.data.data.options.publicKey.user.id = bufferDecode(
        response.data.data.options.publicKey.user.id
      );

      const credential = (await navigator.credentials.create({
        publicKey: response.data.data.options.publicKey,
      })) as PublicKeyCredential;

      if (!credential) {
        throw new Error("Failed to create credential");
      }

      const credentialJSON = JSON.stringify({
        id: credential.id,
        rawId: bufferEncode(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: bufferEncode(
            credential.response.attestationObject
          ),
          clientDataJSON: bufferEncode(credential.response.clientDataJSON),
        },
      });

      // Send the credential to the server
      const response2 = await axios.post(
        `${API_URL}/register-admin-finish/${response.data.data.uuid}`,
        credentialJSON
      );

      return response2.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      }
      throw new Error("An unexpected error occurred, please try again");
    }
  },

  webauthnLogin: async (email: string) => {
    try {
      const response = await axios.post(`${API_URL}/login-admin-begin`, {
        email,
      });

      if (response.data.message === "Please check your email for an otp.") {
        return response.data;
      }

      if (
        response.data.message ===
        "Error getting user credentials, please register for WebAuthn"
      ) {
        const response3 = await AuthService.webauthnRegister(email);
        return response3;
      }

      response.data.data.options.publicKey.challenge = bufferDecode(
        response.data.data.options.publicKey.challenge
      );
      response.data.data.options.publicKey.allowCredentials =
        response.data.data.options.publicKey.allowCredentials.map(
          (listItem: { id: string; type: string; transports?: string[] }) => ({
            ...listItem,
            id: bufferDecode(listItem.id),
          })
        );

      const assertion = (await navigator.credentials.get({
        publicKey: {
          ...response.data.data.options.publicKey,
          allowCredentials:
            response.data.data.options.publicKey.allowCredentials.map(
              (listItem: {
                id: ArrayBuffer;
                type: string;
                transports?: string[];
              }) => ({
                ...listItem,
                transports: listItem.transports as AuthenticatorTransport[],
              })
            ),
        },
      })) as PublicKeyAssertion;

      if (assertion === null) {
        throw new Error("No assertion returned");
      }

      const assertionJSON = JSON.stringify({
        id: assertion.id,
        rawId: bufferEncode(assertion.rawId),
        type: assertion.type,
        response: {
          authenticatorData: bufferEncode(assertion.response.authenticatorData),
          clientDataJSON: bufferEncode(assertion.response.clientDataJSON),
          signature: bufferEncode(assertion.response.signature),
          userHandle: bufferEncode(assertion.response.userHandle),
        },
      });

      // Send the assertion to the server
      const response2 = await axios.post(
        `${API_URL}/login-admin-finish/${response.data.data.uuid}`,
        assertionJSON
      );

      return response2.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      }
      throw new Error("An unexpected error occurred");
    }
  },

  logout: async () => {
    try {
      // Perform the logout request
      const response = await client.post(`${API_URL}/logout`, {
        withCredentials: true,
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw error.response.data;
      }
      throw new Error("An unexpected error occurred whilst logging out");
    }
  },

  updateUserDetails: async (userDetails: {
    email: string;
    name: string;
    dob: string;
    gender: string;
    session_email: string;
    employeeid: string;
    number: string;
    pronouns: string;
  }) => {
    try {
      const response = await axios.post(
        `${API_USER_URL}/update-user`,
        userDetails
      );
      if (response.data.status === 200) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to update user details"
        );
      }
    } catch (error) {
      console.error("Error in updateUserDetails:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw new Error(
        "An unexpected error occurred while updating user details"
      );
    }
  },

  getUserDetails: async (email: string) => {
    try {
      console.log(API_USER_URL);
      const response = await axios.get(
        `${API_USER_URL}/user-details?email=${email}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      console.log("Full user details response:", response);
      if (response.status === 200) {
        return response.data.data; // The user details are in the 'data' field
      } else {
        throw new Error(response.data.message || "Failed to get user details");
      }
    } catch (error) {
      console.error("Error in getUserDetails:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.message || "Failed to get user details"
        );
      }
      throw new Error(
        "An unexpected error occurred while fetching user details"
      );
    }
  },

  verifyOtpLogin: async (email: string, otp: string) => {
    try {
      console.log("Verifying OTP:", email, otp);
      const response = await axios.post(`${API_URL}/verify-otp-login`, {
        email,
        otp,
      });
      if (response.data.status === 200) {
        return response.data;
      } else {
        throw new Error(response.data.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("Error in verifyOtpLogin:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      }
      throw new Error("An unexpected error occurred during OTP verification");
    }
  },
};

function bufferEncode(value: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function bufferDecode(value: string | null): Uint8Array | null {
  if (value === null) {
    return null;
  }

  // Replace URL-safe characters with standard Base64 characters
  value = value.replace(/-/g, "+").replace(/_/g, "/");

  // Add necessary padding
  while (value.length % 4) {
    value += "=";
  }

  // Decode Base64 string
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

export default AuthService;
