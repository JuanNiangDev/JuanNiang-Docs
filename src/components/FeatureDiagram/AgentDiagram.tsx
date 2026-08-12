import type {JSX} from 'react';
import bytedance from '../../icons/brands/bytedance';
import openai from '../../icons/brands/openai';
import anthropic from '../../icons/brands/anthropic';
import googlegemini from '../../icons/brands/googlegemini';
import deepseek from '../../icons/brands/deepseek';
import qwen from '../../icons/brands/qwen';
import minimax from '../../icons/brands/minimax';
import glm from '../../icons/brands/glm';
import kimi from '../../icons/brands/kimi';
import {BRAND, TXT, SOFTER, Brand} from './common';

export default function AgentDiagram(): JSX.Element {
  return (
    <svg viewBox="0 0 240 138" role="img" aria-label="Agent：左侧能力，中间Eino，右侧多模型">
      {/* 左栏 */}
      <g className="a-rise">
        <rect x="4" y="14" width="46" height="20" rx="10" fill={BRAND} opacity="0.13" />
        <text x="27" y="28" fontSize={7.5} textAnchor="middle" fontWeight={700} fill={BRAND}>MCP</text>
        <text x="27" y="45" fontSize={6} textAnchor="middle" fill={TXT}>协议接入</text>
      </g>
      <g className="a-rise" style={{animationDelay: '0.2s'}}>
        <rect x="4" y="58" width="46" height="20" rx="10" fill={BRAND} opacity="0.13" />
        <text x="27" y="72" fontSize={7.5} textAnchor="middle" fontWeight={700} fill={BRAND}>Skills</text>
        <text x="27" y="89" fontSize={6} textAnchor="middle" fill={TXT}>技能编排</text>
      </g>
      <g className="a-rise" style={{animationDelay: '0.4s'}}>
        <rect x="4" y="102" width="46" height="20" rx="10" fill={BRAND} opacity="0.13" />
        <text x="27" y="116" fontSize={7.5} textAnchor="middle" fontWeight={700} fill={BRAND}>Tools</text>
        <text x="27" y="133" fontSize={6} textAnchor="middle" fill={TXT}>工具调用</text>
      </g>

      {/* 中栏 Eino SDK - 水平居中（中心 x=85） */}
      <g className="a-rise" style={{animationDelay: '0.1s'}}>
        <rect x="60" y="26" width="50" height="86" rx="10" fill={BRAND} opacity="0.07" stroke={BRAND} strokeWidth="1" />
        <text x="85" y="52" fontSize={9} textAnchor="middle" fontWeight={800} fill={BRAND}>Eino</text>
        <text x="85" y="66" fontSize={7.5} textAnchor="middle" fontWeight={700} fill={BRAND}>SDK</text>
        <Brand icon={bytedance} x={79} y={80} s={0.5} color={SOFTER} />
      </g>

      {/* 右栏 2x4 - 垂直居中（两行中心 y=69） */}
      <g className="a-rise" style={{animationDelay: '0.15s'}}><Brand icon={openai}     x={126} y={46}  s={0.5} cls="m-openai" /></g>
      <g className="a-rise" style={{animationDelay: '0.25s'}}><Brand icon={anthropic}  x={156} y={46}  s={0.5} cls="m-anthropic" /></g>
      <g className="a-rise" style={{animationDelay: '0.35s'}}><Brand icon={googlegemini} x={186} y={46}  s={0.5} cls="m-googlegemini" /></g>
      <g className="a-rise" style={{animationDelay: '0.45s'}}><Brand icon={deepseek}   x={216} y={46}  s={0.5} cls="m-deepseek" /></g>
      <g className="a-rise" style={{animationDelay: '0.55s'}}><Brand icon={qwen}       x={126} y={88}  s={0.5} cls="m-qwen" /></g>
      <g className="a-rise" style={{animationDelay: '0.65s'}}><Brand icon={minimax}    x={156} y={88}  s={0.5} color="#ef4444" /></g>
      <g className="a-rise" style={{animationDelay: '0.75s'}}><Brand icon={glm}        x={186} y={88}  s={0.5} color="#000" /></g>
      <g className="a-rise" style={{animationDelay: '0.85s'}}><Brand icon={kimi}       x={216} y={88}  s={0.5} color="#000" /></g>

      {/* 连接 中->右 */}
      <path d="M112 50h12" stroke={SOFTER} strokeWidth="1" strokeDasharray="3 2" fill="none" className="a-draw" />
      <path d="M112 88h12" stroke={SOFTER} strokeWidth="1" strokeDasharray="3 2" fill="none" className="a-draw" />
    </svg>
  );
}
