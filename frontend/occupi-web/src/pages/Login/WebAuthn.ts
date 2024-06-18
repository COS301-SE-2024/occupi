// webauthn.ts

import { mockRegisterCredential, mockAuthenticateWithCredential } from './MockBackend';

export const registerCredential = async (): Promise<PublicKeyCredential | null> => {
  try {
    const credentialCreationOptions = await mockRegisterCredential();
    const credential = await navigator.credentials.create({ publicKey: credentialCreationOptions }) as PublicKeyCredential;
    return credential;
  } catch (error) {
    console.error('Error registering credential:', error);
    throw error;
  }
};

export const authenticateWithCredential = async (): Promise<PublicKeyCredential | null> => {
  try {
    const credentialRequestOptions = await mockAuthenticateWithCredential();
    const assertion = await navigator.credentials.get({ publicKey: credentialRequestOptions }) as PublicKeyCredential;
    return assertion;
  } catch (error) {
    console.error('Error authenticating with credential:', error);
    throw error;
  }
};
