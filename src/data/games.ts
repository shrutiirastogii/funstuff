import type { Game } from '../components/Card';

const games: Game[] = [
  {
    name: 'SolarSizer',
    description: 'Size a solar + heat pump setup and race to payback.',
    path: '/solar-sizer',
    // image: '/images/solar-sizer.png', // add once you have artwork
  },
  {
    name: 'Learn With Pixel',
    description: 'Learn a new skill in a few minutes.',
    path: '/learn-with-pixel',
    // image: '/images/learn-with-pixel.png', // add once you have artwork
  },
  {
    name: 'VibeCheck',
    description: 'Test your reaction time and color perception.',
    path: '/vibe-check',
    // image: '/images/vibe-check.png', // add once you have artwork
  },
    {
    name: 'ChainReaction',
    description: 'Guess the word in the chain.',
    path: '/chain-reaction',
    // image: '/images/chain-reaction.png', // add once you have artwork
  },
];

export default games;