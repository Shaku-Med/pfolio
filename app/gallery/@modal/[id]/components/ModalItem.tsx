import ModalPreviewItem from '@/app/gallery/@modal/[id]/components/ModalPreviewItem'
import { Gallery } from '@/app/admin/projects/page'
import { ErrorCard } from '@/app/posts/[id]/page'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogTitle } from '@/components/ui/dialog'
import React, { useState } from 'react'
import { useDeviceStatus } from '@/app/hooks/useDeviceStatus'

const ModalItem = ({item, index}: {item: Gallery, index: number}) => {
    const { isMobileInstalledPortrait,} = useDeviceStatus()

    const [expandedItems, setExpandedItems] = useState<{ [key: number]: boolean }>({})
  
    const toggleDescription = (index: number) => {
      setExpandedItems(prev => ({
        ...prev,
        [index]: !prev[index]
      }))
    }
    
    try {
        return (
          <>
            <div className=' w-full h-full relative'>
                <ModalPreviewItem gallery={item} />
            </div>
          </>
        )
    }
    catch {
        return <ErrorCard title="Failed to Load" message="This gallery does not exist." />
    }

}

export default ModalItem
