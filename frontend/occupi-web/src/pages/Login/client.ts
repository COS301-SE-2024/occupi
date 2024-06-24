import { client } from '@passwordless-id/webauthn'

await client.isLocalAuthenticator()
const challenge = "a7c61ef9-dc23-4806-b486-2428938a547e"
const registration = await client.register("Arnaud", challenge, {
  authenticatorType: "auto",
  userVerification: "required",
  timeout: 60000,
  attestation: true,
  userHandle: "Optional server-side user id. Must not reveal personal information.",
  debug: false,

})