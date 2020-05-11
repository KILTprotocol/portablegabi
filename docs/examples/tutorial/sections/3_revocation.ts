/* eslint-disable @typescript-eslint/explicit-function-return-type */

/**
 * In case you have to change something here, please copy paste the inside of this function (without return)
 * to 4_revocation.md L#32-39 of the tutorial example
 */
export default async function tutorialRevocation({
  pubKey: attestersPublicKey,
  attester,
  credential,
  accumulator: accPreRevo,
  witness: witnessToBeRevoked,
}: any) {
  // Issue attestations and store witnesses.
  const accPostRevo = await attester.revokeAttestation({
    accumulator: accPreRevo,
    // The list of witnesses associated with the credentials which should get revoked.
    witnesses: [witnessToBeRevoked],
  })
  console.log('Accumulator after revocation:\n\t', accPostRevo.toString())
  // Publish the accumulator after revocation.

  try {
    const newCredential = await credential.update({
      attesterPubKey: attestersPublicKey,
      accumulators: [accPostRevo],
    })
    console.log('newCredential:\n\t', newCredential)
  } catch (e) {
    if (e.message.includes('updateAllCredential')) {
      console.log(
        'Caught expected throw when trying to update the revoked credential'
      )
    } else throw e
  }
  return true
}
