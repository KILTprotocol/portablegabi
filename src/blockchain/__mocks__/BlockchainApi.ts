import Accumulator from '../../attestation/Accumulator'
import { strToUint8Arr } from '../Blockchain.utility'

const api = {
  tx: {
    portablegabiPallet: {
      // mocked updateAccumulator returns value of input accumulator by default
      updateAccumulator: jest.fn(
        async (accumulator: Accumulator): Promise<void> => {
          // mock new accumulator list
          await api.query.portablegabiPallet.accumulatorList.mockReturnValue({
            registry: {},
            ...strToUint8Arr(accumulator.valueOf()),
          } as any)
        }
      ),
    },
  },
  query: {
    portablegabiPallet: {
      // mocked accumulatorList returns string of input address by default
      accumulatorList: jest.fn(async ([address]: [string]) => {
        return { registry: {}, ...strToUint8Arr(address) }
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

export default api
 