import { useEffect, useState } from 'react';
import TabPanel from '../TabPanel/TabPanel';
import './App.css';

const DATA_BASE_PATH = './data';
const ACTIVE_TAB_KEY = 'activeTab';
const LANGUAGE_KEY = 'language';
const DEFAULT_TAB = 'Performance';
const DEFAULT_LANGUAGE = 'sv';

const tabs = [
  {
    id: 'artiklar',
    label: { sv: 'Artiklar', fa: 'مقالات' },
    dataPath: { sv: `${DATA_BASE_PATH}/artiklar.json`, fa: `${DATA_BASE_PATH}/artiklar.fa.json` }
  },
  {
    id: 'bilder',
    label: { sv: 'Bilder', fa: 'تصاویر' },
    dataPath: { sv: `${DATA_BASE_PATH}/bilder.json`, fa: `${DATA_BASE_PATH}/bilder.fa.json` }
  },
  {
    id: 'Performance',
    label: { sv: 'Performance', fa: 'اجراها' },
    dataPath: { sv: `${DATA_BASE_PATH}/Performance.json`, fa: `${DATA_BASE_PATH}/Performance.fa.json` }
  },
  {
    id: 'interview',
    label: { sv: 'Interview', fa: 'مصاحبه‌ها' },
    dataPath: { sv: `${DATA_BASE_PATH}/interview.json`, fa: `${DATA_BASE_PATH}/interview.fa.json` }
  },
  {
    id: 'pdfs',
    label: { sv: 'Dokuments', fa: 'اسناد' },
    dataPath: { sv: `${DATA_BASE_PATH}/pdfs.json`, fa: `${DATA_BASE_PATH}/pdfs.fa.json` }
  }
];

const translations = {
  sv: {
    logo: 'Keyvan Kianian',
    title: 'Profil',
    printButton: 'Skriv ut sidan',
    allList: '☰ Alla listor',
    languageLabel: 'Välj språk',
    languageNames: { sv: 'SV', fa: 'FA' }
  },
  fa: {
    logo: 'کیوان کیانیان',
    title: 'پروفایل',
    printButton: 'چاپ صفحه',
    allList: '☰ فهرست کامل',
    languageLabel: 'انتخاب زبان',
    languageNames: { sv: 'SV', fa: 'FA' }
  }
};

const App = () => {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_TAB;
    }
    const saved = localStorage.getItem(ACTIVE_TAB_KEY);
    return tabs.some((tab) => tab.id === saved) ? saved : DEFAULT_TAB;
  });
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved && translations[saved]) return saved;
    if (typeof navigator !== 'undefined' && navigator.language?.startsWith('fa')) return 'fa';
    return DEFAULT_LANGUAGE;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_TAB_KEY, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.body.dir = language === 'fa' ? 'rtl' : 'ltr';
  }, [language]);

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

  const handlePrint = () => {
    if (typeof window === 'undefined') return;
    window.print();
  };

  const handleLanguageChange = (nextLanguage) => {
    if (!translations[nextLanguage]) return;
    setLanguage(nextLanguage);
  };

  const localizedStrings = translations[language] ?? translations[DEFAULT_LANGUAGE];

  return (
    <>
      <header>
        <span className="logo">{localizedStrings.logo}</span>
        <div className="title-group">
          <h1 className="title">{localizedStrings.title}</h1>
          <div className="language-switch" aria-label={localizedStrings.languageLabel}>
            {Object.keys(translations).map((langKey) => (
              <button
                key={langKey}
                type="button"
                className={`language-button ${language === langKey ? 'active' : ''}`}
                onClick={() => handleLanguageChange(langKey)}
              >
                {localizedStrings.languageNames[langKey] ?? langKey.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className="print-button" onClick={handlePrint}>
          {localizedStrings.printButton}
        </button>
      </header>

      <div className="tabs-container">
        <button className="sidebar-toggle" type="button" onClick={toggleSidebar}>
          {localizedStrings.allList}
        </button>
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tablink ${tab.id === activeTab ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {typeof tab.label === 'string'
                ? tab.label
                : tab.label[language] || tab.label[DEFAULT_LANGUAGE]}
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
          language={language}
        />
      ))}

      <div className={`overlay ${sidebarOpen ? 'show' : ''}`} onClick={closeSidebar}></div>
    </>
  );
};

export default App;
