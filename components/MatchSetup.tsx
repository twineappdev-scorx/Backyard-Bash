
import React, { useState, useEffect } from 'react';
import { MatchSettings, MatchFormat, SpecialRule } from '../types';
import { DEFAULT_SPECIAL_RULES } from '../constants';

interface Props {
  onStart: (settings: MatchSettings, playerNames: string[]) => void;
}

const MatchSetup: React.FC<Props> = ({ onStart }) => {
  const [format, setFormat] = useState<MatchFormat>(MatchFormat.Overs);
  const [overs, setOvers] = useState(5);
  const [wickets, setWickets] = useState(10); // Default to 10 wickets
  const [inningsPerSide, setInningsPerSide] = useState(1); // Default to 1 inning per side
  const [rules, setRules] = useState<SpecialRule[]>(DEFAULT_SPECIAL_RULES);
  const [players, setPlayers] = useState<string[]>(['Player 1', 'Player 2']);
  const [newPlayerName, setNewPlayerName] = useState('');

  // Custom Rule State
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [customRuleName, setCustomRuleName] = useState('');
  const [customRuleRuns, setCustomRuleRuns] = useState(0);
  const [customRuleWickets, setCustomRuleWickets] = useState(0);

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers([...players, newPlayerName.trim()]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleAddCustomRule = () => {
    if (!customRuleName.trim()) return;
    const newRule: SpecialRule = {
      id: `custom-${Date.now()}`,
      name: customRuleName,
      description: `Custom rule: ${customRuleRuns} runs, ${customRuleWickets} wickets awarded.`,
      enabled: true,
      customRuns: customRuleRuns,
      customWickets: customRuleWickets
    };
    setRules([...rules, newRule]);
    setCustomRuleName('');
    setCustomRuleRuns(0);
    setCustomRuleWickets(0);
    setShowRuleForm(false);
  };

  const handleStart = () => {
    if (players.length < 2) {
      alert("At least 2 players required!");
      return;
    }
    if (format === MatchFormat.OneVsOne && players.length !== 2) {
      alert("1v1 format requires exactly 2 players!");
      return;
    }

    // Calculate absolute total innings: innings per side * number of players/teams
    const totalInnings = inningsPerSide * players.length;

    onStart({
      format,
      oversPerInnings: overs,
      wicketsPerInnings: wickets,
      numberOfInnings: totalInnings,
      specialRules: rules
    }, players);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center">
        <h2 className="text-4xl font-bungee text-green-600 mb-2">Setup Match</h2>
        <p className="text-gray-500">Pick your rules, grab your bat!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
            <i className="fas fa-cog text-green-500"></i> Settings
          </h3>
          
          <div>
            <label className="block text-sm font-semibold mb-1">Match Format</label>
            <select 
              value={format} 
              onChange={(e) => setFormat(e.target.value as MatchFormat)}
              className="w-full p-2 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none"
            >
              {Object.values(MatchFormat).map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Overs</label>
              <input 
                type="number" 
                min="1"
                value={overs} 
                onChange={(e) => setOvers(Math.max(1, Number(e.target.value)))}
                className="w-full p-2 rounded-lg border"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Wickets</label>
              <input 
                type="number" 
                min="1"
                value={wickets} 
                onChange={(e) => setWickets(Math.max(1, Number(e.target.value)))}
                className="w-full p-2 rounded-lg border"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-green-700">Innings per side</label>
            <input 
              type="number" 
              min="1"
              value={inningsPerSide} 
              onChange={(e) => setInningsPerSide(Math.max(1, Number(e.target.value)))}
              className="w-full p-2 rounded-lg border border-green-200 bg-green-50"
            />
            <p className="text-[10px] text-gray-400 mt-1">Total match innings: {inningsPerSide * players.length}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
            <i className="fas fa-users text-blue-500"></i> Players
          </h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Add Player"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
              className="flex-1 p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              onClick={handleAddPlayer}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2">
            {players.map((p, idx) => (
              <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-gray-200">
                {p}
                <button onClick={() => removePlayer(idx)} className="text-red-400 hover:text-red-600">
                  <i className="fas fa-times-circle"></i>
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <i className="fas fa-balance-scale text-purple-500"></i> Backyard Rules
          </h3>
          <button 
            onClick={() => setShowRuleForm(true)}
            className="text-sm bg-purple-100 text-purple-600 px-3 py-1 rounded-full hover:bg-purple-200 transition"
          >
            <i className="fas fa-plus mr-1"></i> Add Custom Rule
          </button>
        </div>

        {showRuleForm && (
          <div className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-200 space-y-3 animate-in slide-in-from-top-2">
            <p className="font-bold text-purple-700 text-sm">Define Custom Rule</p>
            <input 
              type="text" 
              placeholder="Rule Name (e.g. Over the Fence)" 
              className="w-full p-2 border rounded-lg"
              value={customRuleName}
              onChange={(e) => setCustomRuleName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500">Runs Awarded</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded-lg" 
                  value={customRuleRuns}
                  onChange={(e) => setCustomRuleRuns(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">Wickets Awarded</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded-lg" 
                  value={customRuleWickets}
                  onChange={(e) => setCustomRuleWickets(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleAddCustomRule}
                className="flex-1 bg-purple-600 text-white p-2 rounded-lg font-bold"
              >
                Add Rule
              </button>
              <button 
                onClick={() => setShowRuleForm(false)}
                className="px-4 bg-gray-200 p-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rules.map(rule => (
            <div 
              key={rule.id}
              onClick={() => toggleRule(rule.id)}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                rule.enabled ? 'border-purple-500 bg-purple-50' : 'border-gray-100 bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`font-bold ${rule.enabled ? 'text-purple-700' : 'text-gray-600'}`}>
                  {rule.name}
                </span>
                {rule.enabled && <i className="fas fa-check-circle text-purple-500"></i>}
              </div>
              <p className="text-xs text-gray-500 mt-1">{rule.description}</p>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={handleStart}
        className="w-full py-4 bg-green-500 text-white rounded-2xl font-bungee text-2xl shadow-lg hover:bg-green-600 transform hover:scale-[1.02] transition active:scale-95"
      >
        Toss the Coin!
      </button>
    </div>
  );
};

export default MatchSetup;
