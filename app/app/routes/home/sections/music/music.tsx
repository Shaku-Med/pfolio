import { useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { Reveal, SectionHeader } from "~/components/accessories/Rail/Rail";
import { music, spotifyEmbedUrl } from "~/lib/music";

const PLAYER_HEIGHT = 352;

// Spotify's player loads its own scripts and trackers, so it only mounts once
// someone asks to listen.
function SpotifyPlayer() {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        title={`${music.artistName} on Spotify`}
        src={spotifyEmbedUrl}
        width="100%"
        height={PLAYER_HEIGHT}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        className="block w-full rounded-2xl border-0"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      style={{ height: PLAYER_HEIGHT }}
      className="group flex w-full flex-col items-center justify-center gap-4 rounded-2xl border border-border/70 bg-card/60 text-center transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 group-hover:scale-105">
        <Play className="ml-0.5 h-6 w-6 fill-current" />
      </span>
      <span>
        <span className="block font-medium">Listen to {music.artistName}</span>
        <span className="mt-1 block text-sm text-muted-foreground">
          Loads the Spotify player
        </span>
      </span>
    </button>
  );
}

const MusicSection = () => {
  return (
    <section id="music" className="space-y-8">
      <SectionHeader
        title="Music"
        description={`I also make music, under the name ${music.artistName}.`}
      />
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
        <Reveal>
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              It started as a hobby, and now I put out tracks regularly for a small
              audience that keeps growing.
            </p>
            <p>
              Making a track and writing software feel pretty similar to me. You
              start with nothing and build something from scratch, and the same
              creative energy goes into both. It keeps me balanced.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
              {music.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1 text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  {link.label}
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <SpotifyPlayer />
        </Reveal>
      </div>
    </section>
  );
};

export default MusicSection;
