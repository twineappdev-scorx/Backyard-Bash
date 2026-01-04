
import React, { useState } from 'react';
import MatchSetup from './components/MatchSetup';
import GameScorer from './components/GameScorer';
import MatchSummary from './components/MatchSummary';
import CoinToss from './components/CoinToss';
import { MatchSettings, Innings } from './types';

enum Screen {
  Setup,
  Tossing,
  Game,
  Summary
}

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.Setup);
  const [settings, setSettings] = useState<MatchSettings | null>(null);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [finalInnings, setFinalInnings] = useState<Innings[]>([]);

  const handleStartSetup = (config: MatchSettings, players: string[]) => {
    setSettings(config);
    setPlayerNames(players);
    setScreen(Screen.Tossing);
  };

  const handleTossComplete = (finalPlayerOrder: string[]) => {
    setPlayerNames(finalPlayerOrder);
    setScreen(Screen.Game);
  };

  const handleFinishMatch = (innings: Innings[]) => {
    setFinalInnings(innings);
    setScreen(Screen.Summary);
  };

  const handleRestart = () => {
    setScreen(Screen.Setup);
    setSettings(null);
    setPlayerNames([]);
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] pb-20">
      {/* Dynamic Header */}
      <header className="p-6 text-center">
        <div className="inline-flex items-center gap-3 bg-white px-6 py-2 rounded-full shadow-sm border border-green-100">
          <i className="fas fa-cricket-bat-ball text-green-500 text-2xl"></i>
          <h1 className="text-2xl font-bungee text-green-600 tracking-tight">Backyard Bash</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-4">
        {screen === Screen.Setup && (
          <MatchSetup onStart={handleStartSetup} />
        )}

        {screen === Screen.Tossing && (
          <CoinToss onComplete={handleTossComplete} playerNames={playerNames} />
        )}
        
        {screen === Screen.Game && settings && (
          <GameScorer 
            settings={settings} 
            playerNames={playerNames} 
            onFinish={handleFinishMatch} 
            onReset={handleRestart}
          />
        )}

        {screen === Screen.Summary && (
          <MatchSummary innings={finalInnings} onRestart={handleRestart} />
        )}
      </main>

      {/* Footer / Credits */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-xs text-gray-400 pointer-events-none">
        Developed for Backyard Legends &copy; 2024
      </footer>
    </div>
  );
};

export default App;
