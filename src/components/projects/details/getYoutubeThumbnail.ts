// Extract video ID from URL
// Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
// Video ID: dQw4w9WgXcQ

export function getYouTubeVideoID(videoUrl: string) {
  // Extract video ID from various YouTube URL formats
  const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/)?.[1];
  
  if (!videoId) {
    throw new Error(`Invalid YouTube URL: ${videoUrl}`);
  }
  return videoId;

}

export default function getYouTubeThumbnail(videoUrl: string, quality: 'max' | 'hq' | 'mq' | 'sd' | 'default' = 'hq'): string {
  const videoId = getYouTubeVideoID(videoUrl);
  const qualityMap = {
    'max': 'maxresdefault',    // 1280x720 (best quality)
    'hq': 'hqdefault',          // 480x360 (high quality)
    'sd': 'sddefault',          // 640x480 (standard quality)
    'mq': 'mqdefault',          // 320x180 (medium quality)
    'default': 'default'        // 120x90 (lowest quality)
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}