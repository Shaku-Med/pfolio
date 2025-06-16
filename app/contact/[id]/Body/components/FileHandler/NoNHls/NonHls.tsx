'use client'
import React, { useEffect, useState } from 'react'
import { Message as MessageType } from '@/app/contact/[id]/context/types'
import { cn } from '@/lib/utils'

interface NonHlsProps {
    message?: MessageType
    isPreview?: boolean
    endpoint?: string
    className?: string
}

interface CachedFile {
    id: string;
    file: Blob;
    type: string;
}

const NonHls = ({ message, isPreview = false, endpoint = '/api/chat/messages/file/nostream/', className }: NonHlsProps) => {
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string>('');
    const [fileContent, setFileContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const baseUrl = message?.file_object?.url[0][message?.file_object?.url[0]?.length - 1]
    const audioUrl = `${endpoint}?url=${encodeURIComponent(baseUrl?.split('_')[0] || '')}&id=${message?.user_id}&length=${message?.file_object?.totalChunks}&type=${message?.file_object?.type}`

    const initDB = (): Promise<IDBDatabase> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FileCacheDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('files')) {
                    db.createObjectStore('files', { keyPath: 'id' });
                }
            };
        });
    };

    const getFileFromCache = async (chatId: string): Promise<CachedFile | undefined> => {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('files', 'readonly');
            const store = transaction.objectStore('files');
            const request = store.get(chatId);
            
            request.onsuccess = () => resolve(request.result as CachedFile);
            request.onerror = () => reject(request.error);
        });
    };

    const saveFileToCache = async (chatId: string, file: Blob, type: string): Promise<void> => {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('files', 'readwrite');
            const store = transaction.objectStore('files');
            const request = store.put({ id: chatId, file, type });
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    };

    const readTextFile = async (file: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    };

    const renderFilePreview = () => {
        if (isLoading) {
            return (
                <div className={`flex items-center justify-center p-8 ${isPreview ? 'w-full h-full' : 'bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200'}`}>
                    <div className="flex flex-col items-center space-y-3">
                        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-600 font-medium">Loading file...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className={`p-6 bg-card ${className} ${isPreview ? 'w-full h-full' : 'border border-red-200 rounded-2xl'}`}>
                    <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">!</span>
                        </div>
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                </div>
            );
        }

        if (!fileUrl) return null;

        if (fileType.startsWith('image/')) {
            return (
                <div className={
                    cn(
                        'w-full h-full object-contain',
                        className
                    )
                }>
                    <img 
                        src={fileUrl} 
                        alt="Preview" 
                        loading='lazy'
                        className={`w-full h-auto object-contain ${className} ${isPreview ? 'h-full' : 'max-h-96 transition-transform duration-300 group-hover:scale-105'}`}
                    />
                    {!isPreview && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
                </div>
            );
        }

        if (fileType.startsWith('video/')) {
            return (
                <div className={`overflow-hidden bg-black ${className} ${isPreview ? 'w-full h-full' : 'rounded-2xl border border-gray-200'}`}>
                    <video 
                        src={fileUrl} 
                        controls 
                        className={`w-full object-contain ${isPreview ? 'h-full' : 'max-h-96'}`}
                        preload="metadata"
                    />
                </div>
            );
        }

        if (fileType.startsWith('audio/')) {
            return (
                <div className={`p-6 ${className} ${isPreview ? 'w-full h-full' : 'rounded-2xl border border-purple-200'}`}>
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v6.114A4.369 4.369 0 005 11c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Audio File</h3>
                            <p className="text-gray-600 text-sm">{fileType}</p>
                        </div>
                    </div>
                    <audio 
                        src={fileUrl} 
                        controls 
                        className="w-full"
                        preload="metadata"
                    />
                </div>
            );
        }

        if (fileType === 'application/pdf') {
            return (
                <div className="space-y-4">
                    <div className={`p-4 bg-blue-50 ${className} ${isPreview ? 'w-full h-full' : 'border border-blue-200 rounded-xl'}`}>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">PDF Document</h3>
                                <p className="text-gray-600 text-sm">Click to download and view</p>
                            </div>
                        </div>
                    </div>
                    {!isPreview && (
                        <a 
                            href={fileUrl} 
                            download 
                            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Download PDF
                        </a>
                    )}
                </div>
            );
        }

        if (fileType.includes('text/') || fileType.includes('json') || fileType.includes('xml') || fileType.includes('csv')) {
            return (
                <div className={` overflow-hidden ${className} ${isPreview ? 'w-full h-full' : 'rounded-2xl border border-gray-700'}`}>
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="flex space-x-1">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <span className="text-gray-300 text-sm font-medium">Text File</span>
                        </div>
                        <span className="text-gray-400 text-xs">{fileType}</span>
                    </div>
                    <div className={`p-4 overflow-auto ${isPreview ? 'h-full' : 'max-h-96'}`}>
                        <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                            {fileContent || 'Loading content...'}
                        </pre>
                    </div>
                </div>
            );
        }

        if (fileType.includes('word') || fileType.includes('document') || fileType.includes('msword')) {
            return (
                <div className={`p-6  ${className} ${isPreview ? 'w-full h-full' : 'rounded-2xl border border-blue-200'}`}>
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Word Document</h3>
                            <p className="text-gray-600">Microsoft Word document ready for download</p>
                        </div>
                    </div>
                    {!isPreview && (
                        <a 
                            href={fileUrl} 
                            download 
                            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Download Document
                        </a>
                    )}
                </div>
            );
        }

        if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileType.includes('sheet')) {
            return (
                <div className={`p-6  ${className} ${isPreview ? 'w-full h-full' : 'rounded-2xl border border-green-200'}`}>
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Excel Spreadsheet</h3>
                            <p className="text-gray-600">Excel workbook ready for download</p>
                        </div>
                    </div>
                    {!isPreview && (
                        <a 
                            href={fileUrl} 
                            download 
                            className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Download Spreadsheet
                        </a>
                    )}
                </div>
            );
        }

        if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive')) {
            return (
                <div className={`p-6  ${className} ${isPreview ? 'w-full h-full' : 'rounded-2xl border border-orange-200'}`}>
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Archive File</h3>
                            <p className="text-gray-600">Compressed archive ready for download</p>
                        </div>
                    </div>
                    {!isPreview && (
                        <a 
                            href={fileUrl} 
                            download 
                            className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Download Archive
                        </a>
                    )}
                </div>
            );
        }

        return (
            <div className={`p-6  ${className} ${isPreview ? 'w-full h-full' : 'rounded-2xl border border-gray-200'}`}>
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Unknown File Type</h3>
                        <p className="text-gray-600 text-sm">{fileType || 'Unknown format'}</p>
                    </div>
                </div>
                {!isPreview && (
                    <a 
                        href={fileUrl} 
                        download 
                        className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Download File
                    </a>
                )}
            </div>
        );
    };

    useEffect(() => {
        const chatId = message?.chat_id;
        if (!chatId) return;

        let isMounted = true;
        const fetchFile = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Check cache first
                const cachedFile = await getFileFromCache(chatId);
                
                if (cachedFile && isMounted) {
                    const url = URL.createObjectURL(cachedFile.file);
                    setFileUrl(url);
                    setFileType(cachedFile.type);
                    
                    if (cachedFile.type.includes('text/') || cachedFile.type.includes('json') || 
                        cachedFile.type.includes('xml') || cachedFile.type.includes('csv')) {
                        const content = await readTextFile(cachedFile.file);
                        if (isMounted) {
                            setFileContent(content);
                        }
                    }
                    
                    setIsLoading(false);
                    return; // Exit early if we have a cached file
                }

                // Only fetch if we don't have a cached file
                const response = await fetch(audioUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch file: ${response.statusText}`);
                }
                
                const file = await response.blob();
                const type = message.file_object?.type || 'application/octet-stream';
                
                if (isMounted) {
                    await saveFileToCache(chatId, file, type);
                    
                    const url = URL.createObjectURL(file);
                    setFileUrl(url);
                    setFileType(type);
                    
                    if (type.includes('text/') || type.includes('json') || 
                        type.includes('xml') || type.includes('csv')) {
                        const content = await readTextFile(file);
                        if (isMounted) {
                            setFileContent(content);
                        }
                    }
                    
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Error handling file:', err);
                if (isMounted) {
                    setError('Failed to load file. Please try again.');
                    setIsLoading(false);
                }
            }
        };
        
        fetchFile();

        return () => {
            isMounted = false;
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [message?.chat_id, message?.file_object?.type, audioUrl]); // Only depend on specific message properties

    return (
        <div className={`file-preview-container ${isPreview ? 'w-full h-full' : 'w-full max-w-4xl mx-auto'}`}>
            {renderFilePreview()}
        </div>
    );
};

export default NonHls;