import { create } from 'ipfs-core'
import { useEffect, useState } from 'react'
import {IpfsHttpClient} from 'ipfs-http-client'
const WS = require('libp2p-websockets')
const transportKey = WS.prototype[Symbol.toStringTag]
const filters = require('libp2p-websockets/src/filters')

let ipfs = null

/*
 * A quick demo using React hooks to create an ipfs instance.
 *
 * Hooks are brand new at the time of writing, and this pattern
 * is intended to show it is possible. I don't know if it is wise.
 *
 * Next steps would be to store the ipfs instance on the context
 * so use-ipfs calls can grab it from there rather than expecting
 * it to be passed in.
 */
export default function useIpfsFactory () {
  const [isIpfsReady, setIpfsReady] = useState(Boolean(ipfs))
  const [ipfsInitError, setIpfsInitError] = useState(null)

  useEffect(() => {
    // The fn to useEffect should not return anything other than a cleanup fn,
    // So it cannot be marked async, which causes it to return a promise,
    // Hence we delegate to a async fn rather than making the param an async fn.

    startIpfs()
    return function cleanup () {
      if (ipfs && ipfs.stop) {
        console.log('Stopping IPFS')
        ipfs.stop().catch(err => console.error(err))
        ipfs = null
        setIpfsReady(false)
      }
    }
  }, [])

  async function startIpfs () {
    if (ipfs) {
      console.log('IPFS already started')
    } else if (window.ipfs && window.ipfs.enable) {
      console.log('Found window.ipfs')
      ipfs = await window.ipfs.enable({ commands: ['id'] })
    } else {
      try {
        console.time('IPFS Started')
        ipfs = await create({
          pass: "01234567890123456789",
          EXPERIMENTAL: { ipnsPubsub: true },
          libp2p: {
            config: {
              transport: {
                // This is added for local demo!
                // In a production environment the default filter should be used
                // where only DNS + WSS addresses will be dialed by websockets in the browser.
                [transportKey]: {
                  filter: filters.all
                }
              }
            }
          }
        });
        console.timeEnd('IPFS Started')
      } catch (error) {
        console.error('IPFS init error:', error)
        ipfs = null
        setIpfsInitError(error)
      }
    }

    setIpfsReady(Boolean(ipfs))
  }



  return { ipfs, isIpfsReady, ipfsInitError }
}
