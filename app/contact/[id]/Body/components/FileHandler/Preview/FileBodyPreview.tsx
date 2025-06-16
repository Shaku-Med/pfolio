import { Message } from '@/app/contact/[id]/context/types'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import React, { useState, useEffect } from 'react'
import { Message as MessageType } from '@/app/contact/[id]/context/types'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { toast } from 'sonner'
import SetQuickToken from '@/app/Auth/Functions/SetQuickToken'
import Cookies from 'js-cookie'
import HlsPlayer from '../HlsPlayer'
import AudioPlayer from '../AudioPlayer'
import NonHls from '../NoNHls/NonHls'
import { useDeviceStatus } from '@/app/hooks/useDeviceStatus'
import { useParams } from 'next/navigation'

interface FileBodyPreviewProps {
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
    message?: MessageType | null
}

interface PaginatedResponse {
    messages: Message[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        pageSize: number;
    };
}

const FileBodyPreview = ({isOpen, setIsOpen, message}: FileBodyPreviewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  let path = useParams()
  let {isMobileInstalledPortrait} = useDeviceStatus()

  const fetchMessages = async (page: number) => {
    try {
      setIsLoading(true);

      let sr = await SetQuickToken(`message`, `${Cookies.get('chat_private_token')}`, [], [], true)
      if(!sr){
        toast.error(`Couldn't load other files.`);
        return false;
      }

      const response = await fetch(`/api/chat/messages/file/get?page=${page}&id=${path.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data: PaginatedResponse = await response.json();
      //
      setMessages(prev => {
        const existingIds = new Set(prev.map(msg => msg.id));
        const newMessages = data.messages.filter(msg => !existingIds.has(msg.id));
        return [...prev, ...newMessages];
      });
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.currentPage);
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (message) {
        setMessages(prev => {
          const messageExists = prev.some(msg => msg.id === message.id);
          if (messageExists) {
            return prev;
          }
          return [...prev, message];
        });
      }
      fetchMessages(1);
    }
  }, [isOpen]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchMessages(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchMessages(currentPage + 1);
    }
  };

  const handlePreviousSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : messages.length - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev < messages.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    console.log(messages)
  }, [messages])
  
  return (
    <>
      <Dialog defaultOpen onOpenChange={setIsOpen}>
        <DialogContent className={`z-[1000001] min-w-full min-h-full hidecontrolers ${isMobileInstalledPortrait ? 'max-h-[80%] overflow-auto rounded-none border-none shadow-none p-0 backdrop-blur-lg' : 'max-h-[90%] overflow-auto rounded-none border-none shadow-none p-0 backdrop-blur-lg'}`}>
          <div className="flex flex-col h-full justify-between w-full">
            <div className=' h-full  relative'>
              <div className="w-full h-full flex items-center justify-center">
                {messages.length > 0 && (
                  <div className=" w-full h-full flex">
                    <div className="w-full h-full overflow-hidden relative">
                      {
                        [messages[currentSlide]].map((msg: MessageType, index) => (
                          <div key={index}>
                            {
                                msg.file_object?.type.startsWith('video') || msg.file_object?.type.startsWith('audio') ? (
                                    <>
                                       {
                                          msg.file_object?.type.startsWith('audio') ? (
                                            <AudioPlayer key={`audio-${currentSlide}`} message={msg}/>
                                          ) : (
                                            <HlsPlayer key={`video-${currentSlide}`} message={msg}/>
                                          )
                                       }
                                    </>
                                ) : (
                                    <>
                                       <div className='w-full h-full flex items-center justify-center absolute'>
                                        <NonHls key={`non-hls-${currentSlide}`} message={msg} isPreview={true}/>
                                       </div>
                                    </>
                                )
                            }
                          </div>
                        ))
                      }
                      {/*  */}
                    </div>
                    
                    {messages.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                          onClick={handlePreviousSlide}
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                          onClick={handleNextSlide}
                        >
                          <ChevronRight className="w-6 h-6" />
                        </Button>
                      </>
                    )}
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {messages.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentSlide ? 'bg-white' : 'bg-white/50'
                          }`}
                          onClick={() => setCurrentSlide(index)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border-t">
              <Button
                variant="outline"
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <span className="text-sm">
                {currentPage} of {totalPages}
              </span>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                  <X className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FileBodyPreview
