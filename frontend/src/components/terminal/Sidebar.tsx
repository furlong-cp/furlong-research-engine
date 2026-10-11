import {
  Activity,
  BarChart3,
  ChartNoAxesCombined,
  FlaskConical,
  LayoutDashboard,
  ScrollText,
  SlidersHorizontal,
  Telescope,
  WalletCards,
  Waves,
} from "lucide-react";

export type TerminalTab =
  | "Overview"
  | "Markets"
  | "Watchlist"
  | "Research"
  | "Portfolio"
  | "Experiments"
  | "Benchmarks"
  | "Logs";

type SidebarProps = {
  activeTab: TerminalTab;
  onTabChange: (tab: TerminalTab) => void;
};

const navigation: {
  section: string;
  items: {
    label: TerminalTab;
    icon: typeof LayoutDashboard;
    description: string;
  }[];
}[] = [
  {
    section: "WORKSPACE",
    items: [
      {
        label: "Overview",
        icon: LayoutDashboard,
        description: "Market command center",
      },
      {
        label: "Markets",
        icon: ChartNoAxesCombined,
        description: "Explore instruments",
      },
      {
        label: "Watchlist",
        icon: Waves,
        description: "Tracked instruments",
      },
    ],
  },
  {
    section: "RESEARCH",
    items: [
      {
        label: "Research",
        icon: Telescope,
        description: "Research hypotheses",
      },
      {
        label: "Portfolio",
        icon: WalletCards,
        description: "Exposure and risk",
      },
      {
        label: "Experiments",
        icon: FlaskConical,
        description: "Test strategies",
      },
      {
        label: "Benchmarks",
        icon: BarChart3,
        description: "Compare results",
      },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      {
        label: "Logs",
        icon: ScrollText,
        description: "System activity",
      },
    ],
  },
];

export default function Sidebar({
  activeTab,
  onTabChange,
}: SidebarProps) {
  return (
    <aside className="terminal-sidebar">
      <div className="terminal-brand">
        <div className="terminal-brand-mark">
          <Activity size={20} strokeWidth={1.7} />
        </div>

        <div className="terminal-brand-copy">
          <div className="terminal-brand-name">FURLONG</div>
          <div className="terminal-brand-subtitle">
            RESEARCH ENGINE
          </div>
        </div>
      </div>

      <div className="terminal-workspace">
        <span className="terminal-workspace-dot" />
        <span>RESEARCH WORKSPACE</span>
      </div>

      <nav
        className="terminal-navigation"
        aria-label="Main navigation"
      >
        {navigation.map((group) => (
          <div
            className="terminal-nav-group"
            key={group.section}
          >
            <div className="terminal-nav-section">
              {group.section}
            </div>

            {group.items.map(({ label, icon: Icon, description }) => {
              const active = activeTab === label;

              return (
                <button
                  key={label}
                  type="button"
                  title={description}
                  aria-current={active ? "page" : undefined}
                  className={`terminal-nav-item ${
                    active ? "is-active" : ""
                  }`}
                  onClick={() => onTabChange(label)}
                >
                  <Icon size={16} strokeWidth={1.7} />
                  <span className="terminal-nav-label">
                    {label}
                  </span>
                  {active && (
                    <span className="terminal-nav-indicator" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="terminal-sidebar-spacer" />

      <div className="terminal-sidebar-status">
        <span className="terminal-status-indicator" />
        <div>
          <div className="terminal-status-title">
            Research environment
          </div>
          <div className="terminal-status-caption">
            Local demo · No live feed
          </div>
        </div>
      </div>

      <div className="terminal-sidebar-footer">
        <SlidersHorizontal size={14} />
        <span>Furlong Terminal</span>
        <span className="terminal-version">v0.1</span>
      </div>
    </aside>
  );
}
