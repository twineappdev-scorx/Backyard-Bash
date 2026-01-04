
import { SpecialRule, MatchFormat } from './types';

export const DEFAULT_SPECIAL_RULES: SpecialRule[] = [
  { id: '1h1b', name: 'One Hand, One Bounce', description: 'Fielders can catch with one hand after one bounce.', enabled: false },
  { id: '6out', name: '6 and Out', description: 'Hitting a six results in 6 runs but the batsman is out.', enabled: true },
  { id: 'fence', name: 'Hit the Fence = Out', description: 'If the ball hits the boundary fence/wall directly, you are out.', enabled: false },
  { id: 'elec', name: 'Electric Wickie', description: 'Any touch behind the stumps is out.', enabled: true },
  { id: 'tipsy', name: 'Tipsy-Run (Must Run)', description: 'If the bat touches the ball, you must run.', enabled: false },
  { id: 'lastman', name: 'Last Man Stands', description: 'The last batsman can bat alone until they are out.', enabled: false }
];

export const RUN_OPTIONS = [
  { label: '0', value: 0, color: 'bg-gray-200' },
  { label: '1', value: 1, color: 'bg-blue-100' },
  { label: '2', value: 2, color: 'bg-blue-200' },
  { label: '3', value: 3, color: 'bg-blue-300' },
  { label: '4', value: 4, color: 'bg-green-400' },
  { label: '6', value: 6, color: 'bg-purple-500 text-white' }
];

export const EXTRA_OPTIONS = [
  { label: 'Wide', type: 'Wide' },
  { label: 'No Ball', type: 'No Ball' }
];
