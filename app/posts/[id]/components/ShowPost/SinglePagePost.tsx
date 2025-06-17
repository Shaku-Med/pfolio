'use client'

import { Post } from '../../utils'
import { PostComments } from './components/comments/Comments'
import SideBySideLayout from './components/SideBySideLayout'
import { CommentsProvider } from '@/store/comments-context'
import Content from './Content/Content'

interface SinglePagePostProps {
  posts?: Post
  token?: string
}

const SinglePagePost = ({posts, token}: SinglePagePostProps) => {
  return (
    <div className="min-h-full w-full">
      <CommentsProvider>
        <SideBySideLayout
          content={<Content post={posts}/>}
          comments={<PostComments post={posts} projectId={posts?.id?.toString()} token={token}/>}
        />
      </CommentsProvider>
    </div>
  )
}

export default SinglePagePost
