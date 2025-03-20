import React from 'react';

const SpotifyMusicSection = () => {
  return (
    <div className="flex flex-col space-y-6 w-full bord_s p-6">
      <div className="space-y-2">
        <h2 className="text-4xl font-bold text-center line-clamp-3" title={`go to my page: Medzy Amara`}>Did you know I do music too?</h2>
        <p className=" text-center opacity-[.6]">Check out my latest tracks and follow me to stay updated on new releases.</p>
      </div>
      
      <div className="w-full overflow-hidden shadow-lg rounded-xl">
        <iframe 
          src="https://open.spotify.com/embed/artist/0n7maaPRkmcz9CEJupVCT1?utm_source=generator" 
          width="100%" 
          height="152" 
          frameBorder="0" 
          allowFullScreen 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
          style={{ borderRadius: '12px' }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          <span className="text-sm ">New tracks released monthly</span>
        </div>
        <a href={`https://open.spotify.com/artist/0n7maaPRkmcz9CEJupVCT1`} className="text-sm font-medium hover:">View more</a>
      </div>
    </div>
  );
};

export default SpotifyMusicSection;