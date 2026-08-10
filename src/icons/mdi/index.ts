import type {IconifyIcon, IconifyJSON} from '@iconify/react/offline';
import robot from './robot';
import lightningBolt from './lightning-bolt';
import brain from './brain';
import puzzle from './puzzle';
import monitor from './monitor';
import packageVariantClosed from './package-variant-closed';
import bookOpenVariant from './book-open-variant';
import rocketLaunch from './rocket-launch';
import tools from './tools';
import codeTags from './code-tags';
import github from './github';
import starOutline from './star-outline';
import sourceBranch from './source-branch';

const icons: Record<string, IconifyIcon> = {
  'robot': robot,
  'lightning-bolt': lightningBolt,
  'brain': brain,
  'puzzle': puzzle,
  'monitor': monitor,
  'package-variant-closed': packageVariantClosed,
  'book-open-variant': bookOpenVariant,
  'rocket-launch': rocketLaunch,
  'tools': tools,
  'code-tags': codeTags,
  'github': github,
  'star-outline': starOutline,
  'source-branch': sourceBranch,
};

const collection: IconifyJSON = {
  prefix: 'mdi',
  icons,
};

export default collection;
