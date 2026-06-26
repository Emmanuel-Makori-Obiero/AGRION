import { useState } from "react";
import { Sun, Moon, Home, Phone, Globe, LayoutDashboard } from "lucide-react";
import { LandingPage } from "./pages/Landing";
import { USSDSimulatorPage } from "./pages/USSDSimulator";
import { FarmerAppPage } from "./pages/FarmerAppPage";
import { JudgeDashboard } from "./pages/JudgeDashboard";

type Page = "home" | "ussd" | "webapp" | "judge";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { id: "home" as Page, label: "Home", icon: <Home className="w-4 h-4" /> },
    { id: "ussd" as Page, label: "USSD Simulator", icon: <Phone className="w-4 h-4" /> },
    { id: "webapp" as Page, label: "Web App", icon: <Globe className="w-4 h-4" /> },
    { id: "judge" as Page, label: "Judge Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <LandingPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
      case "ussd":
        return <USSDSimulatorPage />;
      case "webapp":
        return <FarmerAppPage />;
      case "judge":
        return <JudgeDashboard />;
      default:
        return <LandingPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-sand/20 dark:border-dark-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-thunder dark:text-dark-text text-xl">AgriConnect</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-sand/30 dark:border-dark-border hover:bg-cream dark:hover:bg-dark-bg2 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-marigold" /> : <Moon className="w-5 h-5 text-dallas" />}
            </button>

            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    currentPage === item.id
                      ? 'bg-marigold dark:bg-dark-accent text-white'
                      : 'text-dallas dark:text-dark-text2 hover:bg-cream dark:hover:bg-dark-bg2'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden border-t border-sand/20 dark:border-dark-border p-4 space-y-3 bg-white dark:bg-dark-bg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                currentPage === item.id
                  ? 'bg-marigold dark:bg-dark-accent text-white'
                  : 'text-dallas dark:text-dark-text2 hover:bg-cream dark:hover:bg-dark-bg2'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {renderPage()}
    </div>
  );
}