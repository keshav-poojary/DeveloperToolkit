import { useEffect, useMemo, useRef, useState } from 'react';

interface ProfileMeta {
  username: string;
}

interface ProfileData {
  login: string;
  name: string;
  bio: string;
  followers: number | string;
  following: number | string;
  publicRepos: number | string;
  location: string;
  company: string;
  website: string;
  profileUrl: string;
  avatarUrl: string;
}

interface LanguageStat {
  language: string;
  repoCount: number;
  stars: number;
  color: string;
}

interface ExpertLevel {
  label: string;
  description: string;
  accent: string;
  badgeBg: string;
}

interface ContributionCell {
  date: string;
  level: number;
  count: number;
}

interface ContributionResult {
  total: number;
  contributions: ContributionCell[];
}

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Rust: '#dea584',
  Go: '#00ADD8',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Java: '#b07219',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  Vue: '#41b883',
  React: '#61dafb',
};

// GitHub's own contribution-graph palette (empty -> most active)
const HEAT_SHADES = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

function parseGithubProfile(input: string): ProfileMeta | null {
  const normalized = input
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '')
    .replace(/\/$/, '');
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length === 1 && parts[0]) {
    return { username: parts[0] };
  }
  return null;
}

function getExpertLevel(followers: number, publicRepos: number): ExpertLevel {
  if (followers >= 500 || publicRepos >= 100) {
    return {
      label: 'GitHub Genius',
      description: 'A legendary contributor shaping the open-source ecosystem.',
      accent: 'from-amber-400 via-orange-400 to-yellow-300',
      badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    };
  }
  if (followers >= 100 || publicRepos >= 30) {
    return {
      label: 'Open Source Star',
      description: 'High-impact profile with incredible momentum and reach.',
      accent: 'from-cyan-400 via-teal-300 to-emerald-400',
      badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
    };
  }
  return {
    label: 'Rising Creator',
    description: 'A fast-growing developer building cool stuff in public.',
    accent: 'from-violet-400 via-fuchsia-400 to-pink-400',
    badgeBg: 'bg-violet-500/10 border-violet-500/30 text-violet-300',
  };
}

function computeLanguageStats(repos: any[]): LanguageStat[] {
  const map = new Map<string, LanguageStat>();
  repos.forEach((repo: any) => {
    if (!repo.language) return;
    const existing: LanguageStat = map.get(repo.language) ?? {
      language: repo.language,
      repoCount: 0,
      stars: 0,
      color: LANGUAGE_COLORS[repo.language] || '#a855f7',
    };
    existing.repoCount += 1;
    existing.stars += repo.stargazers_count ?? 0;
    map.set(repo.language, existing);
  });
  return Array.from(map.values())
    .sort((a, b) => b.repoCount - a.repoCount || b.stars - a.stars)
    .slice(0, 5);
}

// Real contribution data from a public, no-auth-required GitHub contributions API.
// (GitHub's own REST API does not expose total contribution counts without OAuth.)
async function fetchContributions(username: string): Promise<ContributionResult> {
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`);
  if (!res.ok) throw new Error(`Contributions unavailable (${res.status})`);
  const data = await res.json();
  const totalValues = Object.values(data.total || {}).map((value: unknown) => Number(value) || 0);
  const total = totalValues.reduce((sum, v) => sum + v, 0);
  const contributions = Array.isArray(data.contributions) ? (data.contributions as ContributionCell[]) : [];
  return { total, contributions };
}

// --- Real GitHub-style contribution heatmap, built from actual fetched daily counts ---
function ContributionHeatmap({ contributions, weeks = 26 }: { contributions: ContributionCell[]; weeks?: number }) {
  const cells = useMemo(() => {
    if (!contributions || contributions.length === 0) return [] as ContributionCell[];
    const recent = contributions.slice(-weeks * 7);
    return recent.map((c, i) => ({
      id: `${c.date}-${i}`,
      level: typeof c.level === 'number' ? c.level : 0,
      date: c.date,
      count: c.count,
    }));
  }, [contributions, weeks]);

  if (cells.length === 0) return null;

  const cols = Math.ceil(cells.length / 7);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: 'repeat(7, 1fr)',
        gridAutoFlow: 'column',
        gap: '3px',
      }}
    >
      {cells.map((c, index) => (
        <div
          key={`${c.date}-${index}`}
          title={`${c.date}: ${c.count} contribution${c.count === 1 ? '' : 's'}`}
          className="rounded-[2px]"
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            backgroundColor: HEAT_SHADES[Math.min(c.level, HEAT_SHADES.length - 1)],
          }}
        />
      ))}
    </div>
  );
}

// --- Count-up number for a satisfying "load" moment ---
function CountUp({ value, duration = 900 }: { value: number | string; duration?: number }) {
  const [display, setDisplay] = useState<number | string>(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric)) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(numeric * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  return <>{typeof value === 'number' ? display.toLocaleString() : value}</>;
}

function buildSvg(
  data: ProfileData,
  title: string,
  subtitle: string,
  ctaLabel: string,
  contributionsTotal: number | null,
  contributionCells: ContributionCell[]
) {
  const esc = (s: unknown) => (s ?? '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeTitle = esc(title);
  const safeSubtitle = esc(subtitle);
  const safeCta = esc(ctaLabel);
  const safeName = esc(data.name);
  const safeLogin = esc(data.login);
  const safeBio = esc(data.bio);
  const safeLocation = esc(data.location);
  const safeCompany = esc(data.company);
  const safeWebsite = esc(data.website);

  const infoPanels = [];
  if (data.location) {
    infoPanels.push(`<g>
      <rect x="0" y="0" width="300" height="72" rx="24" ry="24" fill="#0f172a" opacity="0.95" />
      <text x="24" y="44" fill="#ffffff" font-family="Inter, sans-serif" font-size="22" textLength="252" lengthAdjust="spacingAndGlyphs">${safeLocation}</text>
      <text x="24" y="70" fill="#94a3b8" font-family="Inter, sans-serif" font-size="16">Location</text>
    </g>`);
  }
  if (data.company) {
    infoPanels.push(`<g transform="translate(340, 0)">
      <rect x="0" y="0" width="300" height="72" rx="24" ry="24" fill="#0f172a" opacity="0.95" />
      <text x="24" y="44" fill="#ffffff" font-family="Inter, sans-serif" font-size="22" textLength="252" lengthAdjust="spacingAndGlyphs">${safeCompany}</text>
      <text x="24" y="70" fill="#94a3b8" font-family="Inter, sans-serif" font-size="16">Company</text>
    </g>`);
  }
  if (data.website) {
    infoPanels.push(`<g transform="translate(680, 0)">
      <rect x="0" y="0" width="300" height="72" rx="24" ry="24" fill="#0f172a" opacity="0.95" />
      <text x="24" y="44" fill="#ffffff" font-family="Inter, sans-serif" font-size="22" textLength="252" lengthAdjust="spacingAndGlyphs">${safeWebsite}</text>
      <text x="24" y="70" fill="#94a3b8" font-family="Inter, sans-serif" font-size="16">Website</text>
    </g>`);
  }
  const infoPanelsSvg = infoPanels.join('');

  // Compact real-data heatmap strip: last ~20 weeks, drawn as small rects.
  let heatmapSvg = '';
  if (contributionCells && contributionCells.length > 0) {
    const strip = contributionCells.slice(-20 * 7);
    const cellSize = 10;
    const gap = 3;
    const rects = strip
      .map((c, i) => {
        const col = Math.floor(i / 7);
        const row = i % 7;
        const x = col * (cellSize + gap);
        const y = row * (cellSize + gap);
        const fill = HEAT_SHADES[Math.min(c.level ?? 0, HEAT_SHADES.length - 1)];
        return `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" ry="2" fill="${fill}" />`;
      })
      .join('');
    heatmapSvg = `<g transform="translate(460, 420)">
      <text x="0" y="-14" fill="#94a3b8" font-family="Inter, sans-serif" font-size="16">Recent activity</text>
      ${rects}
    </g>`;
  }

  const contribBox = typeof contributionsTotal === 'number'
    ? `<g transform="translate(840, 360)">
      <rect x="0" y="0" width="240" height="110" rx="28" ry="28" fill="#0f172a" opacity="0.95" />
      <text x="24" y="36" fill="#cbd5e1" font-family="Inter, sans-serif" font-size="18">Contributions</text>
      <text x="24" y="72" fill="#39d353" font-family="Inter, sans-serif" font-size="34" font-weight="700">${contributionsTotal.toLocaleString()}</text>
    </g>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6d28d9">
        <animate attributeName="stop-color" values="#6d28d9;#2563eb;#ec4899;#6d28d9" dur="8s" repeatCount="indefinite" />
      </stop>
      <stop offset="100%" stop-color="#2563eb">
        <animate attributeName="stop-color" values="#2563eb;#ec4899;#6d28d9;#2563eb" dur="8s" repeatCount="indefinite" />
      </stop>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="30" flood-color="#000" flood-opacity="0.35" />
    </filter>
  </defs>

  <rect width="1200" height="630" rx="56" ry="56" fill="#020617" />
  <rect x="40" y="40" width="1120" height="550" rx="40" ry="40" fill="url(#gradient)" filter="url(#shadow)" />
  <rect x="80" y="80" width="1040" height="490" rx="32" ry="32" fill="#020617" opacity="0.95" />

  <rect x="100" y="100" width="320" height="320" rx="48" ry="48" fill="#111827" opacity="0.95" />
  <image x="120" y="120" width="280" height="280" xlink:href="${data.avatarUrl}" clip-path="circle(140px at 260px 260px)" />

  <text x="460" y="160" fill="#ffffff" font-family="Inter, sans-serif" font-size="52" font-weight="700">${safeName}</text>
  <text x="460" y="215" fill="#94a3b8" font-family="Inter, sans-serif" font-size="28">@${safeLogin}</text>
  <text x="460" y="255" fill="#cbd5e1" font-family="Inter, sans-serif" font-size="24" letter-spacing="0.02em">${safeTitle}</text>
  <text x="460" y="300" fill="#f8fafc" font-family="Inter, sans-serif" font-size="20" letter-spacing="0.02em">${safeSubtitle}</text>
  <text x="460" y="340" fill="#f8fafc" font-family="Inter, sans-serif" font-size="20" letter-spacing="0.02em">${safeBio}</text>

  <g transform="translate(460, 360)">
    <g>
      <rect x="0" y="0" width="240" height="110" rx="28" ry="28" fill="#0f172a" opacity="0.95" />
      <text x="24" y="36" fill="#cbd5e1" font-family="Inter, sans-serif" font-size="18">Followers</text>
      <text x="24" y="72" fill="#ffffff" font-family="Inter, sans-serif" font-size="34" font-weight="700">${data.followers}</text>
    </g>
    <g transform="translate(280, 0)">
      <rect x="0" y="0" width="240" height="110" rx="28" ry="28" fill="#0f172a" opacity="0.95" />
      <text x="24" y="36" fill="#cbd5e1" font-family="Inter, sans-serif" font-size="18">Following</text>
      <text x="24" y="72" fill="#ffffff" font-family="Inter, sans-serif" font-size="34" font-weight="700">${data.following}</text>
    </g>
    <g transform="translate(560, 0)">
      <rect x="0" y="0" width="240" height="110" rx="28" ry="28" fill="#0f172a" opacity="0.95" />
      <text x="24" y="36" fill="#cbd5e1" font-family="Inter, sans-serif" font-size="18">Repos</text>
      <text x="24" y="72" fill="#ffffff" font-family="Inter, sans-serif" font-size="34" font-weight="700">${data.publicRepos}</text>
    </g>
  </g>

  ${contribBox}
  ${heatmapSvg}

  <g transform="translate(460, 490)">
    ${infoPanelsSvg}
  </g>

  <g transform="translate(820, 545)">
    <rect x="0" y="0" width="260" height="60" rx="20" ry="20" fill="#2563eb" />
    <text x="130" y="38" fill="#ffffff" text-anchor="middle" font-family="Inter, sans-serif" font-size="20" font-weight="700">${safeCta}</text>
  </g>

  <text x="100" y="600" fill="#94a3b8" font-family="Inter, sans-serif" font-size="16">Generated with DevToolkit Visualizer</text>
</svg>`;
}

const GithubVisualizerTool = () => {
  const [profileInput, setProfileInput] = useState('github.com/torvalds');
  const [ctaLabel, setCtaLabel] = useState('Visit Profile');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [languageStats, setLanguageStats] = useState<LanguageStat[]>([]);
  const [contributionsTotal, setContributionsTotal] = useState<number | null>(null);
  const [contributionCells, setContributionCells] = useState<ContributionCell[]>([]);
  const [contributionsError, setContributionsError] = useState(false);
  const [status, setStatus] = useState('Ready to fetch GitHub profile metadata.');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const profileMeta = useMemo(() => parseGithubProfile(profileInput), [profileInput]);
  const previewData = profileData ?? {
    login: profileMeta?.username ?? 'torvalds',
    name: 'Linus Torvalds',
    bio: 'Creator of Linux and Git',
    followers: '—',
    following: '—',
    publicRepos: '—',
    location: 'Portland, OR',
    company: 'Linux Foundation',
    website: 'kernel.org',
    profileUrl: profileMeta ? `https://github.com/${profileMeta.username}` : 'https://github.com/torvalds',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1024025?v=4',
  };

  const title = profileData?.name ?? previewData.name;
  const subtitle = profileData?.bio ? profileData.bio : previewData.bio;

  const expertLevel = useMemo(() => {
    return getExpertLevel(
      typeof previewData.followers === 'number' ? previewData.followers : 0,
      typeof previewData.publicRepos === 'number' ? previewData.publicRepos : 0
    );
  }, [previewData]);

  const totalReposCount = useMemo(() => {
    return languageStats.reduce((acc, curr) => acc + curr.repoCount, 0) || 1;
  }, [languageStats]);

  const fetchMetadata = async () => {
    if (!profileMeta) {
      setStatus('Please enter a valid GitHub username or profile URL.');
      return;
    }
    setLoading(true);
    setContributionsError(false);
    setStatus('Fetching GitHub profile, repository, and contribution data…');
    try {
      const [userResponse, reposResponse, contributionsResult] = await Promise.all([
        fetch(`https://api.github.com/users/${profileMeta.username}`),
        fetch(`https://api.github.com/users/${profileMeta.username}/repos?per_page=100&sort=updated`),
        fetchContributions(profileMeta.username).catch((err) => ({ error: err })) as Promise<ContributionResult | { error: any }>,
      ]);

      if (!userResponse.ok) throw new Error(`User not found (${userResponse.status})`);
      if (!reposResponse.ok) throw new Error(`Repos fetch failed (${reposResponse.status})`);

      const userData = await userResponse.json();
      const reposData = await reposResponse.json();
      const languages = computeLanguageStats(Array.isArray(reposData) ? reposData : []);

      setProfileData({
        login: userData.login ?? profileMeta.username,
        name: userData.name ?? userData.login ?? profileMeta.username,
        bio: userData.bio ?? 'No bio provided.',
        followers: userData.followers ?? 0,
        following: userData.following ?? 0,
        publicRepos: userData.public_repos ?? 0,
        location: userData.location ?? '',
        company: userData.company ?? '',
        website: userData.blog ? userData.blog.replace(/(^https?:\/\/)/, '') : '',
        profileUrl: userData.html_url ?? `https://github.com/${profileMeta.username}`,
        avatarUrl: userData.avatar_url ?? previewData.avatarUrl,
      });
      setLanguageStats(languages);

      if ('error' in contributionsResult) {
        setContributionsTotal(null);
        setContributionCells([]);
        setContributionsError(true);
        setStatus('Profile metadata loaded — live contribution count was unavailable this time.');
      } else {
        setContributionsTotal(contributionsResult.total);
        setContributionCells(contributionsResult.contributions);
        setStatus('Successfully loaded profile metadata, contributions & language analytics!');
      }
    } catch (error) {
      setProfileData(null);
      setLanguageStats([]);
      setContributionsTotal(null);
      setContributionCells([]);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Failed to fetch metadata'}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadSvg = () => {
    const svg = buildSvg(previewData, title, subtitle, ctaLabel, contributionsTotal, contributionCells);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${previewData.login}-profile-card.svg`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    setExporting(true);
    setStatus('Rendering PNG…');
    const svg = buildSvg(previewData, title, subtitle, ctaLabel, contributionsTotal, contributionCells);
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const scale = 2; // export at 2x for crisp, retina-ready PNGs
        const canvas = document.createElement('canvas');
        canvas.width = 1200 * scale;
        canvas.height = 630 * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setStatus('Could not render PNG in this environment — try the SVG download instead.');
          setExporting(false);
          URL.revokeObjectURL(svgUrl);
          return;
        }
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, 1200, 630);
        URL.revokeObjectURL(svgUrl);

        canvas.toBlob((blob) => {
          if (!blob) {
            setStatus('Could not render PNG — try downloading the SVG instead.');
            setExporting(false);
            return;
          }
          const pngUrl = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = pngUrl;
          anchor.download = `${previewData.login}-profile-card.png`;
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          URL.revokeObjectURL(pngUrl);
          setStatus('PNG downloaded — ready to share.');
          setExporting(false);
        }, 'image/png');
      } catch (err) {
        setStatus('Could not render PNG in this environment — try the SVG download instead.');
        setExporting(false);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      setStatus('Could not load the avatar for PNG export — try the SVG download instead.');
      setExporting(false);
    };

    img.src = svgUrl;
  };

  const copyMarkdown = async () => {
    const svg = buildSvg(previewData, title, subtitle, ctaLabel, contributionsTotal, contributionCells);
    const markdown = `![${previewData.name} on GitHub](data:image/svg+xml;base64,${btoa(svg)})`;
    try {
      await navigator.clipboard.writeText(markdown);
      setStatus('Markdown image embed copied to clipboard!');
    } catch {
      setStatus('Could not access clipboard in this environment.');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 sm:p-8 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <style>{`
        @keyframes aura-glow {
          0%, 100% { opacity: 0.4; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.7; transform: scale(1.08) rotate(180deg); }
        }
        @keyframes border-beam {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pop-in {
          0% { opacity: 0; transform: translateY(6px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-aura { animation: aura-glow 12s ease-in-out infinite alternate; }
        .animated-border { background-size: 200% 200%; animation: border-beam 6s ease infinite; }
        .float-card { animation: float-gentle 6s ease-in-out infinite; }
        .pop-in { animation: pop-in 0.4s ease both; }
        .glass-panel {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glass-card {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .glass-input {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.12);
          transition: all 0.25s ease;
        }
        .glass-input:focus {
          border-color: rgba(99, 102, 241, 0.8);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.25);
        }
        .glow-button:disabled { opacity: 0.5; }
      `}</style>

      {/* Background Decorative Aura */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-aura" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[140px] animate-aura" style={{ animationDelay: '-4s' }} />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-600/15 rounded-full blur-[120px] animate-aura" style={{ animationDelay: '-8s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              DevToolkit Visualizer v2.1
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              GitHub Profile <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Visualizer</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1 max-w-xl">
              Transform raw GitHub profiles into stunning interactive cards, README badges, and shareable social media banners — with real contribution data.
            </p>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-3xl p-6 shadow-2xl space-y-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Configuration
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    GitHub Username or Profile URL
                  </label>
                  <input
                    type="text"
                    value={profileInput}
                    onChange={(e) => setProfileInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchMetadata()}
                    placeholder="e.g. torvalds or github.com/torvalds"
                    className="w-full glass-input rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Card CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                    placeholder="e.g. Visit Profile"
                    className="w-full glass-input rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                <button
                  onClick={fetchMetadata}
                  disabled={loading}
                  className="w-full relative group overflow-hidden rounded-2xl p-[1px] font-semibold text-sm focus:outline-none disabled:opacity-60"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animated-border" />
                  <span className="relative flex items-center justify-center gap-2 w-full bg-slate-950 px-5 py-3.5 rounded-[15px] text-white transition group-hover:bg-opacity-80">
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Fetching Live Data...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Fetch Profile Metadata
                      </>
                    )}
                  </span>
                </button>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={downloadPng}
                    disabled={exporting}
                    className="glow-button flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-3 py-3 text-xs sm:text-sm font-semibold text-white transition disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {exporting ? 'Rendering…' : 'PNG'}
                  </button>
                  <button
                    onClick={downloadSvg}
                    className="flex items-center justify-center gap-1.5 rounded-2xl glass-card px-3 py-3 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition group"
                  >
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    SVG
                  </button>
                  <button
                    onClick={copyMarkdown}
                    className="flex items-center justify-center gap-1.5 rounded-2xl glass-card px-3 py-3 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:border-pink-500/50 hover:bg-pink-500/10 transition group"
                  >
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-pink-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    MD
                  </button>
                </div>
              </div>

              {/* Status Message */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1 shrink-0" />
                <p className="leading-relaxed">{status}</p>
              </div>
            </div>

            {/* Quick Stats Panel */}
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Profile Tier Insights</h3>
              <div className={`p-4 rounded-2xl border ${expertLevel.badgeBg} transition-all duration-300`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-bold bg-gradient-to-r ${expertLevel.accent} bg-clip-text text-transparent`}>
                    {expertLevel.label}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-900/60 border border-current">
                    Tier Status
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">{expertLevel.description}</p>
              </div>

              {/* Real contributions summary */}
              <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-emerald-300">Total Contributions</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-900/60 border border-emerald-500/30 text-emerald-300">
                    Last 12 mo
                  </span>
                </div>
                <p className="text-2xl font-black text-white mt-1">
                  {contributionsTotal !== null ? <CountUp value={contributionsTotal} /> : contributionsError ? '—' : '—'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {contributionsError
                    ? 'Live contribution data was unavailable for this fetch — try again.'
                    : contributionsTotal !== null
                      ? 'Pulled from real public contribution history.'
                      : 'Fetch a profile to load real contribution counts.'}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Card Preview Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Live Animated Preview
                </h2>
                <span className="text-xs text-slate-500 font-mono">1200 x 630 Canvas</span>
              </div>

              {/* Main Card Graphic */}
              <div className="relative group float-card">
                <div className="absolute -inset-1 rounded-[36px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-xl group-hover:opacity-60 transition duration-500" />

                <div key={previewData.login} className="relative rounded-[32px] bg-slate-950 p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 overflow-hidden pop-in">
                  {/* Top Profile Header */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="relative shrink-0">
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 animate-pulse opacity-70 blur" />
                      <img
                        src={previewData.avatarUrl}
                        alt="Avatar"
                        className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-slate-800 object-cover shadow-2xl"
                      />
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-2xl font-black text-white truncate">{title}</h3>
                          <p className="text-sm text-indigo-400 font-medium">@{previewData.login}</p>
                        </div>
                        <a
                          href={previewData.profileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 shrink-0"
                        >
                          {ctaLabel}
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </a>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">{subtitle}</p>
                    </div>
                  </div>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl glass-card text-center sm:text-left">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Followers</span>
                      <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                        <CountUp value={previewData.followers} />
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl glass-card text-center sm:text-left">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Following</span>
                      <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                        <CountUp value={previewData.following} />
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl glass-card text-center sm:text-left">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Public Repos</span>
                      <span className="text-xl sm:text-2xl font-black text-white mt-1 block">
                        <CountUp value={previewData.publicRepos} />
                      </span>
                    </div>
                    <div className="p-3.5 rounded-2xl glass-card text-center sm:text-left border border-emerald-500/20">
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">Contributions</span>
                      <span className="text-xl sm:text-2xl font-black text-emerald-300 mt-1 block">
                        {contributionsTotal !== null ? <CountUp value={contributionsTotal} /> : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Real contribution heatmap */}
                  {contributionCells.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300 uppercase tracking-wider">Recent contribution activity</span>
                        <span className="text-slate-500 font-mono">last ~26 weeks</span>
                      </div>
                      <ContributionHeatmap contributions={contributionCells} weeks={26} />
                    </div>
                  )}

                  {/* Meta Details Row */}
                  {(previewData.location || previewData.company || previewData.website) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                      {previewData.location && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-300 truncate">
                          <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span className="truncate">{previewData.location}</span>
                        </div>
                      )}
                      {previewData.company && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-300 truncate">
                          <svg className="w-4 h-4 text-pink-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0h1" />
                          </svg>
                          <span className="truncate">{previewData.company}</span>
                        </div>
                      )}
                      {previewData.website && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-300 truncate">
                          <svg className="w-4 h-4 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                          </svg>
                          <span className="truncate">{previewData.website}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Language Breakdown Widget */}
                  {languageStats.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300 uppercase tracking-wider">Top Languages</span>
                        <span className="text-slate-500 font-mono">{languageStats.length} languages detected</span>
                      </div>

                      <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-800">
                        {languageStats.map((lang) => {
                          const pct = Math.round((lang.repoCount / totalReposCount) * 100);
                          return (
                            <div
                              key={lang.language}
                              className="h-full rounded-sm transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: lang.color || '#818cf8' }}
                              title={`${lang.language}: ${pct}%`}
                            />
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {languageStats.map((lang) => (
                          <span
                            key={lang.language}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300"
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color || '#818cf8' }} />
                            <span className="font-semibold text-white">{lang.language}</span>
                            <span className="text-slate-500">({lang.repoCount})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GithubVisualizerTool;
