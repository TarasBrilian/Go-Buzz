export interface Tab {
  id: string;
  label: string;
}

interface NavigationTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function NavigationTabs({ tabs, activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <nav className="app-nav-bar">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`app-nav-item ${activeTab === tab.id ? 'app-nav-item-active' : ''}`}
            >
              <span className="relative z-10">{tab.label}</span>
              <div className="nav-item-indicator" />
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
