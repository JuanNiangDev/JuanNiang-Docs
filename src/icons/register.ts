import {addCollection} from '@iconify/react/offline';
import mdiCollection from './mdi';

/**
 * 注册离线 Iconify 图标集合（幂等）。
 * 图标数据按单个图标拆分在 ./mdi/ 目录，此处聚合注册。
 */
export function registerIconify(): void {
  addCollection(mdiCollection);
}
