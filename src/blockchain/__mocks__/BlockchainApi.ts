import Accumulator from '../../attestation/Accumulator'
import { Codec } from '@polkadot/types/types'
import { stringToHex } from '@polkadot/util'

const api = {
  tx: {
    portablegabi: {
      // mocked updateAccumulator returns value of input accumulator by default
      updateAccumulator: jest.fn((accumulator: Accumulator): any => {
        // mock new accumulator list
        api.query.portablegabi.accumulatorList.mockReturnValue(
          (stringToHex(accumulator.toString()) as unknown) as Promise<Codec>
        )

        return {
          signAndSend: (addr: any, cb: any) => {
            const result = {
              status: {
                isFinalized: true,
              },
              events: [
                {
                  event: {
                    section: 'system',
                    method: 'ExtrinsicSuccess',
                  },
                },
              ],
            }
            if (typeof cb !== 'undefined') cb(result)
            return new Promise((res) => {
              res()
            })
          },
        }
      }),
    },
  },
  query: {
    portablegabi: {
      // mocked accumulatorList returns string of input address by default
      accumulatorList: jest.fn(async ([address]: [string]) => {
        return (stringToHex(address) as unknown) as Promise<Codec>
      }),
      // mocked accumulatorCount returns string length of input address by default
      accumulatorCount: jest.fn(async (address: string) => address.length),
    },
  },
  disconnect: jest.fn(() => 'disconnected'),
  rpc: {
    chain: {
      getHeader: jest.fn(async () => ({
        number: {
          toNumber: jest.fn(() => new Date().toTimeString()),
        },
      })),
      subscribeNewHeads: jest.fn((callback: Function) =>
        callback({ number: { toNumber: () => new Date().toTimeString() + 1 } })
      ),
    },
  },
}
;(api.query.portablegabi
  .accumulatorList as any).multi = jest.fn(async (arr: string[]) =>
  arr.map((x) => (stringToHex(x) as unknown) as Promise<Codec[]>)
) as any

export default api
