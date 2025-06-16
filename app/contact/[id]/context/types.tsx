type Message_type = 'text' | 'image' | 'video' | 'file' | 'reply';
type Message_status = 'sent' | 'error' | 'sending' | 'delivered' | 'read';

interface FileObject {
    url?:  any;
    name?: string | any;
    type?: string | any;
    size?: number | any;
    customName?: string | any;
    lastModified?: string | any;
    totalChunks?: number | any;
}

export interface Message {
    id?: string;
    user_id?: string;
    to_id?: string;
    message_type?: Message_type;
    message_status?: Message_status;
    message_reply?: string;
    message_thread?: any; // jsonb type
    message?: string;
    file_object?: FileObject; // jsonb type
    created_at?: string;
    received_at?: string;
    updated_at?: string;
    edited?: boolean;
    status?: Message_status;
    chat_id?: string;
    parent_message_id?: string;
}

export interface Admin {
    name?: string
    email?: string
    user_id?: string
    status?: string
    active?: boolean
    active_history?: string
    avatar?: {
        url?: string
        totalChunks?: number
    } | any
}

export interface User {
    user_id?: string
    active?: boolean
    status?: string
}

export interface FileInterface {
    chunkLength?: number;
    chunkingProgress?: number;
    chunks?: any[];
    customeName?: string;
    id?: string;
    path?: string;
    progress?: number;
    responseData?: any;
    status?: string;
    totalChunks?: number;
    url?: string[];
}

export interface Reply {
    chat_id?: string;
    message?: string;
    who?: string;
}