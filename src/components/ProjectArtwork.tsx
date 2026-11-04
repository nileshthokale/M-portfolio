import React, { useState, useEffect, useRef } from 'react';
import {
  ExternalLink,
  ImagePlus,
  Terminal,
  Shield,
  Search,
  Copy,
  Check,
  Lock,
  Sparkles,
  Hash,
  Cpu,
  RefreshCw,
  Code2,
  Send,
} from 'lucide-react';
import { ProjectPreviewVisual } from '../data/portfolio';

interface ProjectArtworkProps {
  visual: ProjectPreviewVisual;
  large?: boolean;
  featured?: boolean;
  stackIndex?: number;
}

// ==========================================
// 1. GOKALIFREE TOOLS HUB (Large Box 01)
// ==========================================
const TOOLS_DATA = [
  {
    name: 'Nmap v7.94',
    category: 'recon',
    categoryLabel: 'Network Recon',
    desc: 'Port scanning, OS fingerprinting & NSE scripts',
    cmd: 'nmap -sV -sC -T4 scanme.gokalifree.in',
    badge: 'Flagship Tool',
  },
  {
    name: 'Burp Suite Pro',
    category: 'web',
    categoryLabel: 'Web Security',
    desc: 'HTTP intercept proxy, Repeater & OWASP testing',
    cmd: 'burpsuite --project-file=audit.burp',
    badge: 'OWASP Top 10',
  },
  {
    name: 'Wireshark v4.2',
    category: 'recon',
    categoryLabel: 'Packet Analysis',
    desc: 'Deep packet inspection & live PCAP stream analyzer',
    cmd: 'tshark -i eth0 -f "tcp port 80" -w dump.pcap',
    badge: 'PCAP Analysis',
  },
  {
    name: 'Metasploit',
    category: 'exploit',
    categoryLabel: 'Exploitation',
    desc: 'Modular penetration testing & payload generator',
    cmd: 'msfconsole -q -x "use exploit/multi/handler"',
    badge: 'Framework',
  },
  {
    name: 'SQLMap',
    category: 'web',
    categoryLabel: 'Database Audit',
    desc: 'Automated SQL injection detection & DB takeover',
    cmd: 'sqlmap -u "https://site.com/?id=1" --batch --dbs',
    badge: 'SQLi Engine',
  },
  {
    name: 'Hydra v9.5',
    category: 'password',
    categoryLabel: 'Password Attack',
    desc: 'High-speed parallel network login cracker',
    cmd: 'hydra -L users.txt -P rockyou.txt ssh://target',
    badge: 'Brute-Force',
  },
];

const GoKaliFreeToolsHub: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const filteredTools = TOOLS_DATA.filter((tool) => {
    const matchesCat = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.cmd.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (cmd: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#04060e] text-[#eef0f5] select-none p-3.5 sm:p-5 overflow-hidden">
      {/* Top Browser Chrome Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-full bg-[#ff4fa3]/90" />
          <span className="w-3 h-3 rounded-full bg-[#ff9a3c]/90" />
          <span className="w-3 h-3 rounded-full bg-[#22c55e]/90" />
        </div>

        {/* Live URL Bar */}
        <div className="flex-1 max-w-md mx-auto hidden sm:flex items-center justify-between px-3 py-1 rounded-lg bg-[#0d1222] border border-white/10 text-[11px] font-mono text-[#38bdf8]">
          <div className="flex items-center gap-1.5 truncate">
            <Lock className="w-3 h-3 text-[#22c55e] shrink-0" />
            <span className="truncate">https://gokalifree.in/tools</span>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] text-[#22c55e] font-semibold shrink-0 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            119+ LIVE
          </span>
        </div>

        {/* External Link Pill */}
        <a
          href="https://gokalifree.in/tools"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#7b5cff]/20 hover:bg-[#7b5cff]/35 border border-[#7b5cff]/40 text-[11px] font-semibold text-[#c4b5fd] transition-colors shrink-0"
        >
          <span>gokalifree.in</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Brand Header & Interactive Category Bar */}
      <div className="pt-3 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#ff4fa3] to-[#7b5cff] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#7b5cff]/30">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display uppercase text-sm sm:text-base tracking-wide text-white leading-none">
              GO KALI FREE
            </h3>
            <p className="text-[10px] sm:text-[11px] font-mono text-[#94a3b8] mt-0.5">
              Ethical Hacking &amp; Kali Linux Atlas · 119+ Tools · 164 Commands
            </p>
          </div>
        </div>

        {/* Live Search */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0a0f1d] border border-white/10 text-xs w-full sm:w-44 focus-within:border-[#38bdf8] transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full bg-transparent border-none text-[11px] text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 shrink-0 text-[11px] font-mono"
      >
        {[
          { id: 'all', label: 'ALL (119+)' },
          { id: 'recon', label: 'RECON' },
          { id: 'web', label: 'WEB SEC' },
          { id: 'exploit', label: 'EXPLOIT' },
          { id: 'password', label: 'PASSWORDS' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id)}
            className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-[#ff4fa3] text-white font-bold shadow-md shadow-[#ff4fa3]/30'
                : 'bg-[#0e1428] text-[#94a3b8] hover:text-white hover:bg-[#141b36] border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tools Cards Grid */}
      <div
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 my-2 flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 max-h-[220px] sm:max-h-[240px] pr-1"
      >
        {filteredTools.map((tool) => (
          <div
            key={tool.name}
            className="group/card rounded-xl p-2.5 bg-[#090d1c] border border-white/10 hover:border-[#ff4fa3]/60 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-bold text-xs text-white truncate group-hover/card:text-[#ff4fa3] transition-colors">
                  {tool.name}
                </span>
                <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/5 text-[#ff9a3c] shrink-0">
                  {tool.badge}
                </span>
              </div>
              <p className="text-[10px] text-[#94a3b8] leading-tight line-clamp-2">
                {tool.desc}
              </p>
            </div>

            {/* Command & Copy button */}
            <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
              <code className="text-[10px] font-mono text-[#38bdf8] truncate bg-[#050812] px-1.5 py-0.5 rounded border border-white/5 flex-1">
                {tool.cmd}
              </code>
              <button
                type="button"
                onClick={(e) => handleCopy(tool.cmd, e)}
                title="Copy command"
                className="p-1 rounded bg-white/5 hover:bg-[#ff4fa3]/20 hover:text-[#ff4fa3] text-[#94a3b8] transition-colors cursor-pointer shrink-0"
              >
                {copiedCmd === tool.cmd ? (
                  <Check className="w-3 h-3 text-[#22c55e]" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Live Scan & Terminal Status Bar */}
      <div className="mt-1 pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[10px] sm:text-[11px] font-mono shrink-0">
        <div className="flex items-center gap-2 text-[#4ade80] truncate">
          <Terminal className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
          <span className="truncate">root@gokalifree:~# nmap -sV -sC -T4 scanme.gokalifree.in</span>
        </div>
        <div className="flex items-center gap-2 text-[#94a3b8] shrink-0 text-[10px]">
          <span className="text-[#38bdf8]">22/ssh</span> ·
          <span className="text-[#4ade80]">80/http</span> ·
          <span className="text-[#ff9a3c]">443/ssl</span> ·
          <span className="text-[#c4b5fd]">Zero Setup</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. GOKALIFREE IN-BROWSER TERMINAL SANDBOX (Small Box 02)
// ==========================================
const GoKaliFreeTerminalSimulator: React.FC = () => {
  const [history, setHistory] = useState<Array<{ cmd: string; out: string }>>([
    {
      cmd: 'whoami && uname -r',
      out: 'kali-learner · 6.6.15-amd64 #1 SMP PREEMPT_DYNAMIC',
    },
    {
      cmd: 'nmap -F scanme.gokalifree.in',
      out: '22/tcp open ssh · 80/tcp open http · 443/tcp open https',
    },
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const consoleRef = useRef<HTMLDivElement | null>(null);
  const isInitialMount = useRef(true);

  const executeCmd = (cmdToRun: string) => {
    const raw = cmdToRun.trim();
    if (!raw) return;

    let out = '';
    const lower = raw.toLowerCase();

    if (lower === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    } else if (lower === 'help') {
      out = 'Commands: tools, nmap, whoami, uname, cat flag.txt, clear, banner';
    } else if (lower.includes('tools')) {
      out = '119+ Tools: Nmap, Burp, Wireshark, Metasploit, SQLMap, Hydra, John...';
    } else if (lower.includes('nmap')) {
      out = 'Nmap scan report for scanme.gokalifree.in: 22/ssh, 80/http, 443/https open';
    } else if (lower.includes('whoami')) {
      out = 'kali-pentester@gokalifree (uid=1000 gid=1000)';
    } else if (lower.includes('uname')) {
      out = 'Linux gokalifree 6.6.15-amd64 #1 SMP Kali GNU/Linux';
    } else if (lower.includes('flag')) {
      out = 'GKF{k4l1_l1nux_b3st_fr33_pl4tf0rm_2026}';
    } else if (lower.includes('banner')) {
      out = 'GO KALI FREE — In-Browser Linux Terminal Simulator v2.4';
    } else {
      out = `gkf: executed '${raw}' safely in browser sandbox. Visit gokalifree.in for full guides!`;
    }

    setHistory((prev) => [...prev.slice(-3), { cmd: raw, out }]);
    setInputVal('');
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#050811] text-[#eef0f5] select-none p-3 overflow-hidden font-mono text-[11px]">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff4fa3]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff9a3c]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
          <span className="ml-1 text-[10px] text-[#94a3b8] font-bold">
            kali@gokalifree: ~ (zsh)
          </span>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          ONLINE
        </span>
      </div>

      {/* Preset Quick Chips */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1 py-1.5 overflow-x-auto no-scrollbar shrink-0 text-[10px]"
      >
        <span className="text-[#94a3b8] text-[9px] mr-1">RUN:</span>
        {['help', 'nmap', 'whoami', 'tools', 'clear'].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => executeCmd(p)}
            className="px-2 py-0.5 rounded bg-[#10172c] hover:bg-[#7b5cff]/30 text-[#38bdf8] hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Output Console History */}
      <div
        ref={consoleRef}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 space-y-1.5 pr-1 py-1 text-[10.5px] leading-tight"
      >
        {history.map((h, i) => (
          <div key={i} className="space-y-0.5">
            <div className="text-[#4ade80] flex items-center gap-1">
              <span className="text-[#ff4fa3]">$</span>
              <span>{h.cmd}</span>
            </div>
            <div className="text-[#94a3b8] pl-2 text-[10px] font-mono break-all">
              {h.out}
            </div>
          </div>
        ))}
      </div>

      {/* Live Input Field */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="mt-1 pt-1.5 border-t border-white/10 flex items-center gap-1.5 shrink-0"
      >
        <span className="text-[#4ade80] font-bold text-[10px]">root@gkf:~#</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              executeCmd(inputVal);
            }
          }}
          placeholder="type command (e.g. nmap, tools)..."
          className="flex-1 bg-transparent border-none text-[10.5px] text-[#38bdf8] placeholder:text-white/30 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => executeCmd(inputVal)}
          className="p-1 rounded bg-[#7b5cff]/20 hover:bg-[#7b5cff]/40 text-[#c4b5fd] cursor-pointer"
        >
          <Send className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 3. GOKALIFREE SECURITY UTILITIES & ENCODERS (Small Box 03)
// ==========================================
const GoKaliFreeUtilitiesWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'base64' | 'hash' | 'ports'>('base64');
  const [inputText, setInputText] = useState<string>('gokalifree.in');
  const [hashOutput, setHashOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Compute live Base64
  const base64Output = (() => {
    try {
      return btoa(inputText);
    } catch {
      return 'Encoding error';
    }
  })();

  // Compute live SHA-256
  useEffect(() => {
    let isCurrent = true;
    if (!inputText) {
      setHashOutput('');
      return;
    }

    if (window.crypto?.subtle) {
      window.crypto.subtle
        .digest('SHA-256', new TextEncoder().encode(inputText))
        .then((buf) => {
          if (!isCurrent) return;
          const hex = Array.from(new Uint8Array(buf))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
          setHashOutput(hex);
        })
        .catch(() => {
          if (isCurrent) setHashOutput('Hashing error');
        });
    } else {
      setHashOutput('Crypto not available');
    }

    return () => {
      isCurrent = false;
    };
  }, [inputText]);

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#060a16] text-[#eef0f5] select-none p-3 overflow-hidden font-mono text-[11px]">
      {/* Title & Tabs */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-[#ff9a3c]" />
          <span className="font-bold text-[10.5px] text-white">SECURITY UTILITIES</span>
        </div>

        {/* Tab Pills */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-[9px]"
        >
          {(['base64', 'hash', 'ports'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-1.5 py-0.5 rounded uppercase font-semibold transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#38bdf8] text-black font-bold'
                  : 'bg-[#0f172a] text-[#94a3b8] hover:text-white border border-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 flex flex-col justify-center py-2" onClick={(e) => e.stopPropagation()}>
        {activeTab === 'base64' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-[#94a3b8]">
              <span>INPUT STRING:</span>
              <span className="text-[#38bdf8]">Base64 Encode</span>
            </div>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full px-2 py-1 rounded bg-[#090e1f] border border-white/10 text-[10.5px] text-white focus:outline-none focus:border-[#38bdf8]"
            />
            <div className="flex items-center justify-between gap-1.5 px-2 py-1 rounded bg-[#030610] border border-[#ff4fa3]/30">
              <span className="text-[10px] text-[#ff4fa3] truncate font-mono">
                {base64Output}
              </span>
              <button
                type="button"
                onClick={(e) => handleCopy(base64Output, e)}
                className="text-[#94a3b8] hover:text-white p-0.5 shrink-0 cursor-pointer"
                title="Copy Base64"
              >
                {copied ? <Check className="w-3 h-3 text-[#22c55e]" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'hash' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-[#94a3b8]">
              <span>CALCULATE SHA-256:</span>
              <span className="text-[#ff9a3c]">Real-time Hashing</span>
            </div>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full px-2 py-1 rounded bg-[#090e1f] border border-white/10 text-[10.5px] text-white focus:outline-none focus:border-[#ff9a3c]"
            />
            <div className="flex items-center justify-between gap-1.5 px-2 py-1 rounded bg-[#030610] border border-[#ff9a3c]/30">
              <span className="text-[9.5px] text-[#ff9a3c] truncate font-mono">
                {hashOutput}
              </span>
              <button
                type="button"
                onClick={(e) => handleCopy(hashOutput, e)}
                className="text-[#94a3b8] hover:text-white p-0.5 shrink-0 cursor-pointer"
                title="Copy Hash"
              >
                {copied ? <Check className="w-3 h-3 text-[#22c55e]" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'ports' && (
          <div className="grid grid-cols-2 gap-1.5 text-[9.5px]">
            <div className="p-1.5 rounded bg-[#090e1f] border border-white/5 flex items-center justify-between">
              <span className="font-bold text-[#4ade80]">PORT 22</span>
              <span className="text-[#94a3b8]">SSH</span>
            </div>
            <div className="p-1.5 rounded bg-[#090e1f] border border-white/5 flex items-center justify-between">
              <span className="font-bold text-[#38bdf8]">PORT 80</span>
              <span className="text-[#94a3b8]">HTTP</span>
            </div>
            <div className="p-1.5 rounded bg-[#090e1f] border border-white/5 flex items-center justify-between">
              <span className="font-bold text-[#ff4fa3]">PORT 443</span>
              <span className="text-[#94a3b8]">HTTPS</span>
            </div>
            <div className="p-1.5 rounded bg-[#090e1f] border border-white/5 flex items-center justify-between">
              <span className="font-bold text-[#ff9a3c]">PORT 3306</span>
              <span className="text-[#94a3b8]">MySQL</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom status line */}
      <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[9.5px] text-[#94a3b8] shrink-0">
        <span className="truncate">GoKaliFree Browser Encoders</span>
        <span className="text-[#38bdf8]">100% Client-Side</span>
      </div>
    </div>
  );
};

// ==========================================
// MAIN EXPORTED COMPONENT
// ==========================================
export const ProjectArtwork: React.FC<ProjectArtworkProps> = ({
  visual,
  large = false,
  featured = false,
  stackIndex = 0,
}) => {
  const emptyLargeHeightClass = 'min-h-[260px] sm:min-h-[340px] lg:h-[524px]';
  const emptySmallHeightClass = 'min-h-[160px] sm:min-h-[180px] lg:h-[252px]';

  // Empty slot template for Project 02 & Project 03
  if (visual.theme === 'empty-slot') {
    return (
      <div
        className={`group relative w-full rounded-[22px] border border-dashed border-white/25 bg-[#090c15]/90 flex flex-col items-center justify-center p-4 sm:p-5 text-center transition-all duration-300 hover:border-[#ff4fa3]/65 hover:bg-[#0d111f] ${
          large ? emptyLargeHeightClass : emptySmallHeightClass
        }`}
      >
        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center text-[#ff9a3c] mb-2 transition-transform duration-300 group-hover:scale-105">
          <ImagePlus className="w-5 h-5" />
        </div>
        <p className="text-[11px] font-mono-num uppercase tracking-widest text-[#ff4fa3]">
          {visual.metricBadge}
        </p>
        <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
          {visual.title}
        </h4>
        <p className="text-xs text-[#eef0f5]/60 mt-0.5 max-w-sm">
          {visual.caption}
        </p>
      </div>
    );
  }

  // GoKaliFree Live Scenes (Project 01)
  const renderGoKaliFreeContent = () => {
    switch (visual.theme) {
      case 'gokalifree-tools':
        return <GoKaliFreeToolsHub />;
      case 'gokalifree-sandbox':
        return <GoKaliFreeTerminalSimulator />;
      case 'gokalifree-articles':
      default:
        return <GoKaliFreeUtilitiesWidget />;
    }
  };

  return (
    <div
      className={`group w-full rounded-[22px] border border-white/20 bg-[#050814] hover:border-[#ff4fa3]/65 active:border-[#ff4fa3] transition-all flex flex-col justify-between overflow-hidden ${
        large ? 'lg:h-[524px]' : 'lg:h-[252px]'
      }`}
    >
      {/* Dynamic Content Container */}
      <div
        className={`w-full bg-[#04060e] overflow-hidden flex flex-col flex-1 ${
          large
            ? 'min-h-[260px] sm:min-h-[340px] lg:min-h-0'
            : 'min-h-[160px] sm:min-h-[180px] lg:min-h-0'
        }`}
      >
        {renderGoKaliFreeContent()}
      </div>

      {/* Dedicated Non-Overlapping Caption Footer */}
      <div className="px-4 py-2 sm:px-5 sm:py-2.5 bg-[#080b15] border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] font-mono-num uppercase tracking-wider text-[#ff9a3c]">
            {visual.metricBadge}
          </p>
          <h4
            className={`font-bold text-white leading-snug mt-0.5 ${
              featured && large ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
            }`}
          >
            {visual.title}
          </h4>
          {visual.caption && (
            <p className="text-[11px] sm:text-xs text-[#eef0f5]/70 mt-0.5 line-clamp-1">
              {visual.caption}
            </p>
          )}
        </div>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 group-hover:bg-[#ff4fa3] group-hover:border-[#ff4fa3] group-active:scale-95 transition-all">
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
