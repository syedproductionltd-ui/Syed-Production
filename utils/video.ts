export type EmbedType = 'youtube' | 'instagram' | 'facebook' | 'direct';

export interface VideoEmbed {
  type: EmbedType;
  embedUrl: string;
  videoId?: string;
}

/**
 * Classifies a video URL and returns the embed descriptor. Ported from the
 * original getVideoEmbed() in js/main.js.
 */
export function getVideoEmbed(url: string): VideoEmbed {
  if (!url) return { type: 'direct', embedUrl: url };

  const yt = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/
  );
  if (yt?.[1]) {
    const id = yt[1];
    return {
      type: 'youtube',
      videoId: id,
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}`,
    };
  }

  const ig = url.match(/instagram\.com\/(?:reel|p)\/([\w-]+)/);
  if (ig?.[1]) {
    return {
      type: 'instagram',
      videoId: ig[1],
      embedUrl: `https://www.instagram.com/reel/${ig[1]}/embed/`,
    };
  }

  if (/facebook\.com\/.*video|fb\.watch\//.test(url)) {
    return {
      type: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        url
      )}&show_text=false&autoplay=true`,
    };
  }

  return { type: 'direct', embedUrl: url };
}