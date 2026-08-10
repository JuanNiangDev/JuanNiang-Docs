import React, {useEffect, useState} from 'react';
import {Icon} from '@iconify/react';
import styles from './styles.module.css';

interface GithubInfoProps {
  owner: string;
  repo: string;
  token?: string;
  baseUrl?: string;
}

interface RepoData {
  stargazers_count?: number;
  forks_count?: number;
  description?: string | null;
}

const formatter = new Intl.NumberFormat('zh-CN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatCount(value: number | null): string {
  if (value == null) return '—';
  return formatter.format(value);
}

/**
 * GitHub 仓库信息卡片：展示 owner/repo、描述与 star/fork 统计。
 * 统计信息在客户端通过 GitHub API 拉取（SSR 阶段不请求）。
 * 参考 kibo-ui / AinOfficialWiki 的 GithubInfo 卡片样式，样式与本项目一致。
 */
export default function GithubInfo({owner, repo, token, baseUrl = 'https://api.github.com'}: GithubInfoProps): JSX.Element {
  const [stars, setStars] = useState<number | null>(null);
  const [forks, setForks] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const ownerName = owner.trim();
  const repoName = repo.trim();
  const href = `https://github.com/${ownerName}/${repoName}`;

  useEffect(() => {
    let cancelled = false;
    let ignore = false;

    async function load() {
      if (!ownerName || !repoName) {
        setStars(null);
        setForks(null);
        setDescription('');
        setError('');
        return;
      }
      try {
        const headers: Record<string, string> = {Accept: 'application/vnd.github+json'};
        if (token && token.trim()) headers.Authorization = `Bearer ${token.trim()}`;
        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/repos/${ownerName}/${repoName}`, {headers});
        if (cancelled || ignore) return;
        if (!response.ok) throw new Error(`GitHub API ${response.status}`);
        const data = (await response.json()) as RepoData;
        setStars(Number(data.stargazers_count ?? 0));
        setForks(Number(data.forks_count ?? 0));
        setDescription(data.description ?? '');
      } catch (err) {
        if (cancelled || ignore) return;
        setStars(null);
        setForks(null);
        setDescription('');
        setError(err instanceof Error ? err.message : '加载失败');
      }
    }

    load();
    return () => {
      cancelled = true;
      ignore = true;
    };
  }, [owner, repo, token, baseUrl]);

  return (
    <a className={styles.card} href={href} target="_blank" rel="noopener noreferrer" aria-busy={stars == null ? 'true' : 'false'}>
      <div className={styles.inner}>
        <span className={styles.avatar} aria-hidden="true">
          <Icon icon="mdi:github" width={36} height={36} />
        </span>
        <div className={styles.content}>
          <p className={styles.title}>
            <span className={styles.owner}>{ownerName}</span>
            <span className={styles.slash} aria-hidden="true">/</span>
            <span className={styles.repo}>{repoName}</span>
          </p>
          {description ? <p className={styles.desc}>{description}</p> : null}
          <div className={styles.meta}>
            <span className={styles.stat}>
              <Icon icon="mdi:star-outline" width={17} height={17} />
              <span>{formatCount(stars)}</span>
            </span>
            <span className={styles.statSep} aria-hidden="true">·</span>
            <span className={styles.stat}>
              <Icon icon="mdi:source-branch" width={17} height={17} />
              <span>{formatCount(forks)}</span>
            </span>
            {error ? <span className={styles.error}>{error}</span> : null}
          </div>
        </div>
      </div>
    </a>
  );
}
