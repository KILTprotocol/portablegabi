import {
  issueAttestation,
  revokeAttestation,
  startAttestation
} from "./wasm_to_typescript/Attester";
import {
  buildCredential,
  genClaimer,
  requestAttestation,
  revealAttributes
} from "./wasm_to_typescript/Claimer";
import {
  startVerificationSession,
  verifyAttributes
} from "./wasm_to_typescript/Verifier";

const runGabiProcess = async (): Promise<void> => {
  try {
    console.time("(1) Claimer");
    const claimer = await genClaimer();
    console.timeEnd("(1) Claimer");
    console.log(claimer);

    console.time("(2) Start attestation");
    const {
      message: startAttestationMsg,
      session: attesterSignSession
    } = await startAttestation({});
    console.timeEnd("(2) Start attestation");
    console.log({ startAttestationMsg, attesterSignSession });

    console.time("(3) Request attestation");
    const {
      message: reqSignMsg,
      session: claimerSignSession
    } = await requestAttestation({
      claimer,
      startAttestationMsg
    });
    console.timeEnd("(3) Request attestation");
    console.log(reqSignMsg, claimerSignSession);

    console.time("(4) Issue attestation");
    const signature = await issueAttestation({
      attesterSignSession,
      reqSignMsg
    });
    console.timeEnd("(4) Issue attestation");
    console.log(signature);

    console.time("(5) Build Credential");
    const credential = await buildCredential({
      claimer,
      claimerSignSession,
      signature
    });
    console.timeEnd("(5) Build Credential");
    console.log(credential);

    console.time("(6) Start Verification");
    const {
      session: verifierSession,
      message: reqRevealedAttrMsg
    } = await startVerificationSession({});
    console.timeEnd("(6) Start Verification");
    console.log(reqRevealedAttrMsg, verifierSession);

    console.time("(7) Reveal Attributes");
    const proof = await revealAttributes({
      claimer,
      credential,
      reqRevealedAttrMsg
    });
    console.timeEnd("(7) Reveal Attributes");
    console.log(proof);

    console.time("(8) Verify Attributes");
    const { claim, verified } = await verifyAttributes({
      proof,
      verifierSession
    });
    console.timeEnd("(8) Verify Attributes");
    console.log(claim, verified);

    console.time("(9) Revoked");
    const revoked = await revokeAttestation();
    console.timeEnd("(9) Revoked");
    console.log(revoked);
  } catch (e) {
    console.error("Gabi process error", e.stack);
  }
};
(async () => runGabiProcess())();
