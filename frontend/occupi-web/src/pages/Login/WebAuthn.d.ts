// WebAuthn.d.ts

declare module './webauthn' {
    export function registerCredential(): Promise<PublicKeyCredential>; // Adjust return type as needed
    export function authenticateWithCredential(): Promise<PublicKeyCredential>; // Adjust return type as needed
  }
  