
import { useEffect, useState } from 'react'
import {create} from 'ipfs-http-client'

let ipfsRPC = null

/*
 * A quick demo using React hooks to create an ipfs rpc instance.
 *
 * Hooks are brand new at the time of writing, and this pattern
 * is intended to show it is possible. I don't know if it is wise.
 *
 * Next steps would be to store the ipfs instance on the context
 * so use-ipfs calls can grab it from there rather than expecting
 * it to be passed in.
 */
export default function useIpfsRPCFactory () {
  const [isIpfsRPCReady, setIpfsRPCReady] = useState(Boolean(ipfsRPC))
  const [ipfsRPCInitError, setIpfsRPCInitError] = useState(null)

  useEffect(() => {
    // The fn to useEffect should not return anything other than a cleanup fn,
    // So it cannot be marked async, which causes it to return a promise,
    // Hence we delegate to a async fn rather than making the param an async fn.

    startIpfsRPC()
    // return function cleanup () {
    //   if (ipfsRPC && ipfsRPC.stop) {
    //     console.log('Stopping IPFS')
    //     ipfsRPC.stop().catch(err => console.error(err))
    //     ipfsRPC = null
    //     setIpfsRPCReady(false)
    //   }
    // }
  }, [])

  async function startIpfsRPC () {
    if (ipfsRPC) {
      console.log('IPFS RPC already started')
    }else {
      try {
        console.time('IPFS RPC Started')
        ipfsRPC = await create('/ip4/127.0.0.1/tcp/5001')
        const { id, agentVersion } = await ipfsRPC.id();
        console.log( id, agentVersion,'dsaf')
        console.timeEnd('IPFS RPC Started')
      } catch (error) {
        console.error('IPFS init error:', error)
        ipfsRPC = null
        setIpfsRPCInitError(error)
      }
    }

    setIpfsRPCReady(Boolean(ipfsRPC))
  }



  return { ipfsRPC, isIpfsRPCReady, ipfsRPCInitError }
}
