
import { Search, Clock3, Database, ChevronDown } from "lucide-react";

type TopbarProps = {
  activeTab: string;
  onSearch?: (query: string) => void;
};

export default function Topbar({ activeTab, onSearch }: TopbarProps) {
  return (
    <header className="terminal-topbar">
      <div className="terminal-breadcrumb">
        <span className="terminal-breadcrumb-root">Furlong</span>
        <span className="terminal-breadcrumb-separator">/</span>
        <span className="terminal-breadcrumb-current">{activeTab}</span>
      </div>

      <div className="terminal-topbar-tools">
        <label className="terminal-search">
          <Search size={15} />
          <input
            type="search"
            placeholder="Search instruments..."
            aria-label="Search instruments"
            onChange={(event) => onSearch?.(event.target.value)}
          />
          <kbd>⌘ K</kbd>
        </label>

        <div className="terminal-data-status" title="Synthetic demonstration data">
          <Database size={14} />
          <span>DEMO DATA</span>
          <span className="terminal-data-status-dot" />
        </div>

        <div className="terminal-clock-label">
          <Clock3 size={14} />
          <span>RESEARCH MODE</span>
        </div>

        <button
          className="terminal-profile-button"
          type="button"
          title="Local demo profile"
          aria-label="Local demo profile"
        >
          <span className="terminal-profile-avatar">F</span>
          <ChevronDown size={13} />
        </button>
      </div>
    </header>
  );
}