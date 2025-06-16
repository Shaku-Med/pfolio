import { useEffect, useState } from 'react'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

export const useDeviceFingerprint = () => {
  const [fingerprint, setFingerprint] = useState<string>('')

  useEffect(() => {
    const getFingerprint = async () => {
      const fp = await FingerprintJS.load()
      const result = await fp.get()
      setFingerprint(result.visitorId)
    }
    getFingerprint()
  }, [])

  return fingerprint
}

export const DeviceFingerprint = () => {
  const fingerprint = useDeviceFingerprint()

  return null
} 