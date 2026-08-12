import type {IconifyIcon, IconifyJSON} from '@iconify/react/offline';
import redis from './redis';
import go from './go';
import openai from './openai';
import bytedance from './bytedance';
import vuedotjs from './vuedotjs';
import vuetify from './vuetify';
import lua from './lua';
import postgresql from './postgresql';
import docker from './docker';
import anthropic from './anthropic';
import googlegemini from './googlegemini';
import deepseek from './deepseek';
import qwen from './qwen';
import minimax from './minimax';
import glm from './glm';
import kimi from './kimi';
import onebot from './onebot';

const icons: Record<string, IconifyIcon> = {
  'redis': redis,
  'go': go,
  'openai': openai,
  'bytedance': bytedance,
  'vuedotjs': vuedotjs,
  'vuetify': vuetify,
  'lua': lua,
  'postgresql': postgresql,
  'docker': docker,
  'anthropic': anthropic,
  'googlegemini': googlegemini,
  'deepseek': deepseek,
  'qwen': qwen,
  'minimax': minimax,
  'glm': glm,
  'kimi': kimi,
  'onebot': onebot,
};

const collection: IconifyJSON = {
  prefix: 'brands',
  icons,
};

export default collection;
