import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IAudioMetadata } from 'music-metadata';

interface AudioMetadataProps {
  file: globalThis.File;
}

export function AudioMetadata({ file }: AudioMetadataProps) {
  const [metadata, setMetadata] = useState<IAudioMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const extractMetadata = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Import music-metadata dynamically to avoid SSR issues
        const mm = await import('music-metadata');
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const metadata = await mm.parseBuffer(uint8Array, file.type);
        
        setMetadata(metadata);
      } catch (error) {
        console.error('Error extracting audio metadata:', error);
        setError('Failed to extract audio metadata');
      } finally {
        setLoading(false);
      }
    };

    extractMetadata();
  }, [file]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Audio Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading metadata...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Audio Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!metadata) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Audio Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {metadata.common.title && (
          <div>
            <span className="font-semibold">Title:</span> {metadata.common.title}
          </div>
        )}
        {metadata.common.artist && (
          <div>
            <span className="font-semibold">Artist:</span> {metadata.common.artist}
          </div>
        )}
        {metadata.common.album && (
          <div>
            <span className="font-semibold">Album:</span> {metadata.common.album}
          </div>
        )}
        {metadata.common.year && (
          <div>
            <span className="font-semibold">Year:</span> {metadata.common.year}
          </div>
        )}
        {metadata.common.genre && metadata.common.genre.length > 0 && (
          <div>
            <span className="font-semibold">Genre:</span> {metadata.common.genre.join(', ')}
          </div>
        )}
        {metadata.common.picture && metadata.common.picture.length > 0 && (
          <div className="mt-4">
            <img
              src={URL.createObjectURL(new Blob([metadata.common.picture[0].data], { type: metadata.common.picture[0].format }))}
              alt="Album cover"
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
        )}
        {metadata.format.duration && (
          <div>
            <span className="font-semibold">Duration:</span> {Math.floor(metadata.format.duration / 60)}:{String(Math.floor(metadata.format.duration % 60)).padStart(2, '0')}
          </div>
        )}
        {metadata.format.bitrate && (
          <div>
            <span className="font-semibold">Bitrate:</span> {Math.round(metadata.format.bitrate / 1000)} kbps
          </div>
        )}
        {metadata.format.sampleRate && (
          <div>
            <span className="font-semibold">Sample Rate:</span> {metadata.format.sampleRate / 1000} kHz
          </div>
        )}
      </CardContent>
    </Card>
  );
} 