import { getPost } from "@/app/about/components/GetInfos"
import { ErrorCard } from "./[id]/page"

import db from "@/lib/Database/Supabase/Base";
import { Post } from "@/app/admin/posts/[id]/page"
import { Admin } from "@/app/contact/[id]/context/types"
import MyCard from "./components/MyCard";

const page = async () => {
  try {
    if(!db) return <ErrorCard title="Error" message="Connection failed!" />
    // 
    const currentPage = 1;
    const itemsPerPage = 6;
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    // 
    let posts = await getPost(4, [`id`, `text`, `location`, `post_file`, `description`, `tags`, `likes`, `comments`, `shares`, `views`, `user_id`, `created_at`, `updated_at`], {from, to})
    if(!posts || posts.length === 0) return <ErrorCard title="Error" message="No posts found" />
    // 
    let {data: admin, error: adminError} = await db.from('admin').select('*')
    if(adminError || !admin) return <ErrorCard title="Error" message={`Looks like there's no owner of this website!`} />
    let adminData = (admin[0] as unknown) as Admin
    // 

    // console.log(from)

    return (
      <>
        <MyCard post={(posts as unknown) as Post[]} adminData={adminData} />
      </>
    )
  }
  catch {
    return <ErrorCard title="Error" message="Something went wrong" />
  }
}

export default page
