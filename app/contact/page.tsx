import React from 'react'
import ContactHome from './components/Home/Home'
import SetToken from '../Auth/IsAuth/Token/SetToken'
import { headers } from 'next/headers'

const page = async () => {
  let h = await headers()
  let token = await SetToken({
    expiresIn: `1h`,
    algorithm: `HS512`,
  })

  return (
    <>
      <ContactHome token={token}/>
    </>
  )
}

export default page
