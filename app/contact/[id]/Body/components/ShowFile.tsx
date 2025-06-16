import React from 'react'
import { Message as MessageType } from '../../context/types'
import HandleFileShow from './HandleFileShow'

interface ShowFileProps {
    message?: MessageType
}
const ShowFile = ({message}: ShowFileProps) => {
  if (!message || !message.file_object?.type) return null

  return (
    <>
    <HandleFileShow isManual={message.file_object.type.startsWith('video') || message.file_object.type.startsWith('audio')} message={message}/>
    </>
  )
}

export default ShowFile
