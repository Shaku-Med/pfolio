import { getGallery } from "@/app/about/components/GetInfos"
import { ErrorCard } from "../posts/[id]/ErrorCard"
import MasonryGallery from "./components/GalleryClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    absolute: 'Gallery | Mohamed Amara | Medzy Amara'
  }
}

const page = async () => {
  try {

    const itemsPerPage = 12
    const from = 0
    const to = from + itemsPerPage - 1
  
    const initialItems = await getGallery(itemsPerPage, ['*'], { from, to })

    if(!initialItems || initialItems.length < 1) {
      return <ErrorCard title="Error" message="No gallery items found" />
    }

      return (
        <>
          <MasonryGallery items={initialItems}/>
        </>
      )
  }
  catch {
    return <ErrorCard title="Error" message="Failed to fetch gallery items" />
  }
}

export default page
