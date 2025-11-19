import { useEffect, useState } from 'react';
import TabPanel from '../TabPanel/TabPanel';
import './App.css';

const DATA_BASE_PATH = './data';
const ACTIVE_TAB_KEY = 'activeTab';
const DEFAULT_TAB = 'Performance';

const tabs = [
  { id: 'artiklar', label: 'Artiklar', dataPath: `${DATA_BASE_PATH}/artiklar.json` },
  { id: 'bilder', label: 'Bilder', dataPath: `${DATA_BASE_PATH}/bilder.json` },
  { id: 'Performance', label: 'Performance', dataPath: `${DATA_BASE_PATH}/Performance.json` },
  { id: 'interview', label: 'Interview', dataPath: `${DATA_BASE_PATH}/interview.json` },
  { id: 'pdfs', label: 'Dokuments', dataPath: `${DATA_BASE_PATH}/pdfs.json` }
];

const App = () => {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_TAB;
    }
    const saved = localStorage.getItem(ACTIVE_TAB_KEY);
    return tabs.some((tab) => tab.id === saved) ? saved : DEFAULT_TAB;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_TAB_KEY, activeTab);
  }, [activeTab]);

  useEffect(() => {
    document.body.classList.toggle('sidebar-open', sidebarOpen);
    return () => document.body.classList.remove('sidebar-open');
  }, [sidebarOpen]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <header>
        <span className="logo">Keyvan Kianian</span>
        <h1 className="title">Profile</h1>
      </header>

      <div className="tabs-container">
        <button className="sidebar-toggle" type="button" onClick={toggleSidebar}>
          ☰ All List
        </button>
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tablink ${tab.id === activeTab ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {tabs.map((tab) => (
        <TabPanel
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTab}
          isSidebarOpen={sidebarOpen}
          closeSidebar={closeSidebar}
        />
      ))}

      <div className={`overlay ${sidebarOpen ? 'show' : ''}`} onClick={closeSidebar}></div>
    </>
  );
};

export default App;
