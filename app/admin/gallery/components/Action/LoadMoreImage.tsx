'use server'

import { getGallery } from "@/app/about/page";

const LoadMoreImage = async (itemsPerPage?: number, from?: number, to?: number) => {
  try {
    let galleries = await getGallery(itemsPerPage, ['*'], { from, to })
    return galleries || []
  }
  catch {
    return null
  }
}

export default LoadMoreImage
