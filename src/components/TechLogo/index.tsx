import {Icon} from '@iconify/react/offline';
import type {JSX} from 'react';

/**
 * 技术栈标识（本地离线）：
 * 全部走本地 brands 集合（monochrome currentColor），颜色由 .techLogoItem 的 color 控制。
 */
const BRAND_ICONS: Record<string, string> = {
  'Go': 'brands:go',
  'Eino SDK': 'brands:bytedance',
  'OneBot11': 'brands:onebot',
  'LLM（OpenAI 兼容）': 'brands:openai',
  'Vue 3': 'brands:vuedotjs',
  'Vuetify 3': 'brands:vuetify',
  'Lua（gopher-lua）': 'brands:lua',
  'PostgreSQL': 'brands:postgresql',
  'Redis': 'brands:redis',
  'Docker Compose': 'brands:docker',
};

export default function TechLogo({name}: {name: string}): JSX.Element {
  const icon = BRAND_ICONS[name];
  if (icon) {
    return <Icon icon={icon} width={20} height={20} aria-hidden="true" />;
  }
  return <span aria-hidden="true">{name}</span>;
}
