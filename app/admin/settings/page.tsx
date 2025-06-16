import React from 'react'
import Settings from '../Pages/Settings/Settings'

const page = () => {
  try {
    
    return (
      <>
        <Settings/>
      </>
    )
  }
  catch {
    return (
      <>
        <div>
          Something went wrong.
        </div>
      </>
    )
  }
}

export default page
