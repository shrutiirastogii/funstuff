export interface LearnVideo {
  id: string; // unique tile id, e.g. "rubiks-cube"
  title: string; // short, punchy title shown on the tile
  category: string; // e.g. "Puzzles", "Crafts", "Life Skills"
  youtubeVideoId: string; // the part after v= in a youtube url
  embeddable?: boolean; // set to false if you confirm a video blocks embedding
}

// Fill this in with your curated 50. Placeholder entries below show the shape.
// Thumbnail is derived automatically from youtubeVideoId, no need to store it.
const videos: LearnVideo[] = [
  {
    id: "rubiks-cube",
    title: "Solve a Rubik's Cube",
    category: "Puzzles",
    youtubeVideoId: "7Ron6MN45LY",
  },
  {
    id: "origami-swan",
    title: "Fold an Origami Swan",
    category: "Crafts",
    youtubeVideoId: "dQw4w9WgXcQ", // replace with the real video id
  },
  // ... add up to 50 total entries
];

export function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export default videos;