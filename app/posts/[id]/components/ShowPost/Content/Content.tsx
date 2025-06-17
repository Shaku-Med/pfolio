import React from 'react'
import { Post } from '../../../utils'
import PostFiles from './components/PostFiles'

const Content = ({post}: {post?: Post}) => {
  return (
    <>
      <div className="bg-black w-full h-full">
        <PostFiles post={post} />
      </div>
    </>
  )
}

export default Content
