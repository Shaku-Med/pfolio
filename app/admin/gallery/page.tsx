import { getGallery } from '@/app/about/components/GetInfos'
import GalleryComponent from './components/Gallery'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { JSX } from 'react'

interface GalleryPageProps {}

const GalleryPage = async (): Promise<JSX.Element> => {
  const itemsPerPage = 12
  const from = 0
  const to = from + itemsPerPage - 1

  const initialItems = await getGallery(itemsPerPage, ['*'], { from, to })

  if (initialItems.length < 1) {
    return (
      <div className="flex min-h-screen items-center justify-center ">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-6 p-8">
            <div className="rounded-full bg-background p-4">
              <Plus className="h-12 w-12 " />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold ">
                No gallery items found
              </h1>
              <p className="mt-2 ">
                Start building your gallery by creating your first item
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/admin/gallery/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Gallery Item
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="">
      <div className="container mx-auto lg:px-10 px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl text-center border-b pb-4 font-bold ">
            Gallery
          </h1>
        </div>
        <GalleryComponent 
          initialItems={initialItems} 
          itemsPerPage={itemsPerPage} 
        />
      </div>
    </div>
  )
}

export default GalleryPage