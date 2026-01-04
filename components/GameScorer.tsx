
import React, { useState, useEffect, useCallback } from 'react';
import { MatchSettings, PlayerStats, Innings, BallRecord, MatchFormat, SpecialRule } from '../types';
import { RUN_OPTIONS, EXTRA_OPTIONS } from '../constants';

interface Props {
  settings: MatchSettings;
  playerNames: string[];
  onFinish: (innings: Innings[]) => void;
  onReset: () => void;
}

const GameScorer: React.FC<Props> = ({ settings, playerNames, onFinish, onReset }) => {
  const [currentInningsIdx, setCurrentInningsIdx] = useState(0);
  const [inningsData, setInningsData] = useState<Innings[]>([]);
  const [strikerIdx, setStrikerIdx] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [pendingInningsData, setPendingInningsData] = useState<Innings[] | null>(null);

  // Initialize Innings
  useEffect(() => {
    const initialInnings: Innings[] = Array.from({ length: settings.numberOfInnings }).map((_, i) => {
      const initialBatsmen = playerNames.map(name => ({
        name,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        out: false
      }));

      return {
        batsmen: initialBatsmen,
        balls: [],
        totalScore: 0,
        totalWickets: 0,
        totalOvers: 0,
        totalBalls: 0
      };
    });
    setInningsData(initialInnings);

    if (settings.format === MatchFormat.OneVsOne) {
      setStrikerIdx(currentInningsIdx % playerNames.length);
    } else {
      setStrikerIdx(0);
    }
  }, [settings, playerNames]);

  // Adjust striker when innings changes via standard flow
  useEffect(() => {
    if (settings.format === MatchFormat.OneVsOne) {
      setStrikerIdx(currentInningsIdx % playerNames.length);
    } else {
      setStrikerIdx(0);
    }
  }, [currentInningsIdx, settings.format, playerNames.length]);

  const currentInnings = inningsData[currentInningsIdx];
  const striker = currentInnings?.batsmen[strikerIdx];

  const proceedToNext = () => {
    if (pendingInningsData) {
      setInningsData(pendingInningsData);
      const nextIdx = currentInningsIdx + 1;
      if (nextIdx < settings.numberOfInnings) {
        setCurrentInningsIdx(nextIdx);
      } else {
        onFinish(pendingInningsData);
      }
      setShowSwapModal(false);
      setPendingInningsData(null);
    }
  };

  const handleBall = useCallback((runs: number, isWicket: boolean, extra?: string, wicketsAwarded: number = 0) => {
    if (!currentInnings || !striker || striker.out || showSwapModal) return;

    const newInningsData = [...inningsData];
    const inn = { ...newInningsData[currentInningsIdx] };
    const bats = [...inn.batsmen];
    
    const newBall: BallRecord = {
      batsmanName: striker.name,
      runs: runs,
      isWicket: isWicket || wicketsAwarded > 0,
      isExtra: !!extra,
      extraType: extra as any,
      timestamp: Date.now()
    };

    inn.totalScore += runs + (extra ? 1 : 0);
    
    const currentStriker = { ...bats[strikerIdx] };
    currentStriker.runs += runs;
    if (!extra || extra === 'No Ball') currentStriker.balls += 1;
    if (runs === 4) currentStriker.fours += 1;
    
    let losingWicketThisBall = isWicket || wicketsAwarded > 0;

    // Logic for 6 and Out Rule
    if (runs === 6) {
        currentStriker.sixes += 1;
        if (settings.specialRules.find(r => r.id === '6out')?.enabled) {
            losingWicketThisBall = true;
            currentStriker.outMethod = "6 and OUT!";
        }
    }

    if (losingWicketThisBall) {
      const addedWickets = wicketsAwarded || 1;
      inn.totalWickets += addedWickets;
      
      if (settings.format === MatchFormat.OneVsOne) {
        if (inn.totalWickets >= settings.wicketsPerInnings) {
          currentStriker.out = true;
          currentStriker.outMethod = currentStriker.outMethod || "All Lives Lost";
        }
      } else {
        currentStriker.out = true;
        currentStriker.outMethod = currentStriker.outMethod || "Out!";
      }
    }

    bats[strikerIdx] = currentStriker;
    inn.batsmen = bats;
    inn.balls = [...inn.balls, newBall];

    if (!extra) {
      inn.totalBalls += 1;
      inn.totalOvers = Math.floor(inn.totalBalls / 6) + (inn.totalBalls % 6) / 10;
    }

    const isWicketLimitReached = inn.totalWickets >= settings.wicketsPerInnings;
    const isOverLimitReached = inn.totalBalls >= settings.oversPerInnings * 6;
    
    const isEndingInnings = isWicketLimitReached || isOverLimitReached;

    newInningsData[currentInningsIdx] = inn;

    if (isEndingInnings) {
      if (currentInningsIdx < settings.numberOfInnings - 1) {
        // Show Swap Modal for all innings transitions
        setPendingInningsData(newInningsData);
        setShowSwapModal(true);
      } else {
        // Last innings, finish immediately
        onFinish(newInningsData);
      }
    } else {
      // Not ending innings, check if current striker is out to cycle to next player in team formats
      if (currentStriker.out && settings.format !== MatchFormat.OneVsOne) {
        const nextIdx = (strikerIdx + 1) % playerNames.length;
        bats[nextIdx] = { ...bats[nextIdx], out: false };
        setStrikerIdx(nextIdx);
      }
      setInningsData(newInningsData);
    }
  }, [inningsData, currentInningsIdx, strikerIdx, settings, playerNames, onFinish, showSwapModal, currentInnings, striker]);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the match? All progress will be lost!")) {
      onReset();
    }
  };

  if (!currentInnings || !striker) return <div className="p-10 text-center">Loading Field...</div>;

  const last10Balls = currentInnings.balls.slice(-10).reverse();
  
  // Predict whose innings is next
  // For 1v1, it's just the other player. For Teams, it might depend on batting order.
  // We use currentInningsIdx + 1 as the key indicator.
  const nextInningsIndex = currentInningsIdx + 1;
  const nextPlayerName = settings.format === MatchFormat.OneVsOne 
    ? playerNames[nextInningsIndex % playerNames.length]
    : `Innings ${nextInningsIndex + 1}`;

  const customRuleButtons = settings.specialRules.filter(r => r.enabled && (r.customRuns !== undefined || r.customWickets !== undefined));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Innings Change Over Card (Swap Modal) */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl text-center space-y-6 border-8 border-green-500 animate-in zoom-in duration-300">
            <div className="space-y-2">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-sync-alt text-4xl text-green-500 animate-spin-slow"></i>
              </div>
              <h2 className="text-4xl font-bungee text-green-600">INNINGS OVER!</h2>
              <p className="text-lg font-bold text-gray-500 uppercase tracking-widest">End of Innings {currentInningsIdx + 1}</p>
            </div>

            <div className="bg-gray-50 rounded-3xl p-6 border-2 border-gray-100 shadow-inner">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Final Innings Score</p>
              <div className="text-6xl font-bungee text-gray-800">
                {pendingInningsData?.[currentInningsIdx].totalScore}
                <span className="text-2xl opacity-40"> / {pendingInningsData?.[currentInningsIdx].totalWickets}</span>
              </div>
              <div className="flex justify-center gap-4 mt-3">
                <p className="text-sm font-bold text-gray-500">{pendingInningsData?.[currentInningsIdx].totalOvers.toFixed(1)} Overs</p>
                <div className="w-1 h-1 bg-gray-300 rounded-full my-auto"></div>
                <p className="text-sm font-bold text-gray-500">{pendingInningsData?.[currentInningsIdx].totalBalls} Balls</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-400 uppercase mb-1">Coming Up Next</p>
                <p className="text-3xl font-bungee text-blue-600">{nextPlayerName}</p>
              </div>
              <button 
                onClick={proceedToNext}
                className="w-full py-5 bg-green-500 text-white rounded-2xl font-bungee text-3xl shadow-xl hover:bg-green-600 transform hover:scale-105 transition active:scale-95 flex items-center justify-center gap-3"
              >
                SWAP PLACES!
                <i className="fas fa-arrow-right text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoreboard Header */}
      <div className="bg-green-600 text-white rounded-3xl p-6 shadow-2xl flex justify-between items-center overflow-hidden relative border-b-4 border-green-700">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-200 font-bold uppercase tracking-widest text-xs">Innings {currentInningsIdx + 1} of {settings.numberOfInnings}</p>
              <h1 className="text-6xl font-bungee leading-none mt-1">
                {currentInnings.totalScore}<span className="text-2xl opacity-70"> / {currentInnings.totalWickets}</span>
              </h1>
              <p className="text-lg opacity-90 mt-2 font-semibold">OVERS: {currentInnings.totalOvers.toFixed(1)} / {settings.oversPerInnings}</p>
            </div>
            <button 
              onClick={handleReset}
              className="bg-red-500/20 hover:bg-red-500/40 p-3 rounded-full transition-colors ml-4"
              title="Reset Match"
            >
              <i className="fas fa-redo-alt text-white"></i>
            </button>
          </div>
        </div>
        <div className="text-right relative z-10">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              <span className="bg-green-500 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest">LIVE SCORE</span>
            </div>
            <span className="text-xs opacity-80 font-bold uppercase tracking-wider">Striker:</span>
            <span className="text-2xl font-bungee">{striker.name}</span>
            <div className="flex gap-4 mt-1 bg-white/10 px-4 py-2 rounded-2xl">
                <div className="text-center">
                    <p className="text-[10px] opacity-70 font-bold uppercase">Runs</p>
                    <p className="text-2xl font-bungee">{striker.runs}</p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] opacity-70 font-bold uppercase">Balls</p>
                    <p className="text-2xl font-bungee">{striker.balls}</p>
                </div>
            </div>
          </div>
        </div>
        <i className="fas fa-cricket-bat-ball absolute -right-4 -bottom-4 text-9xl text-green-700 opacity-20 transform rotate-12"></i>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Score This Ball</h3>
            
            <div className="grid grid-cols-3 gap-4">
              {RUN_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleBall(opt.value, false)}
                  className={`${opt.color} h-24 rounded-2xl shadow-sm text-3xl font-bungee hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-black/10`}
                >
                  {opt.label}
                  <span className="text-xs font-sans font-bold opacity-60">RUNS</span>
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              {EXTRA_OPTIONS.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => handleBall(0, false, opt.type)}
                  className="bg-orange-100 text-orange-700 h-16 rounded-2xl text-xl font-bungee hover:bg-orange-200 transition border-b-4 border-orange-200"
                >
                  {opt.label} <span className="text-xs font-sans font-bold opacity-70">+1</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => handleBall(0, true)}
              className="w-full mt-6 bg-red-500 text-white h-24 rounded-2xl text-3xl font-bungee shadow-lg hover:bg-red-600 active:bg-red-700 transform hover:-translate-y-1 transition border-b-4 border-red-700"
            >
              OUT! <span className="text-sm font-sans block opacity-80 mt-1 uppercase font-bold tracking-widest">
                {settings.format === MatchFormat.OneVsOne 
                  ? `LIFE LOST (${currentInnings.totalWickets + 1}/${settings.wicketsPerInnings})` 
                  : `WICKET FALLS (${currentInnings.totalWickets + 1}/${settings.wicketsPerInnings})`}
              </span>
            </button>

            {customRuleButtons.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Special Backyard Actions</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {customRuleButtons.map(rule => (
                    <button
                      key={rule.id}
                      onClick={() => handleBall(rule.customRuns || 0, (rule.customWickets || 0) > 0, undefined, rule.customWickets)}
                      className="bg-purple-50 border-2 border-purple-100 text-purple-700 p-3 rounded-2xl text-xs font-bold hover:bg-purple-100 transition text-center flex flex-col items-center justify-center"
                    >
                      <span className="mb-1 leading-tight">{rule.name}</span>
                      <span className="text-[10px] opacity-60 font-bungee">
                        {rule.customRuns}R / {rule.customWickets}W
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Balls Log */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Last 10 Balls</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {last10Balls.length === 0 && <p className="text-gray-300 text-xs italic">First ball pending...</p>}
              {last10Balls.map((ball, idx) => (
                <div 
                  key={idx}
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bungee text-sm shadow-md transform transition hover:scale-110 ${
                    ball.isWicket ? 'bg-red-500 text-white ring-4 ring-red-100' : 
                    ball.isExtra ? 'bg-orange-100 text-orange-700 border-2 border-orange-200' :
                    ball.runs === 6 ? 'bg-purple-600 text-white ring-4 ring-purple-100' :
                    ball.runs === 4 ? 'bg-green-500 text-white ring-4 ring-green-100' :
                    'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  {ball.isWicket ? 'W' : (ball.isExtra ? ball.extraType?.charAt(0) : ball.runs)}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 h-fit">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
            {settings.format === MatchFormat.OneVsOne ? 'Innings Record' : 'Team Scorecard'}
          </h3>
          <div className="space-y-3">
            {currentInnings.batsmen.map((player, idx) => {
              const isActive = idx === strikerIdx;
              const isOut = player.out;
              
              // Filter out non-active non-scoring players in 1v1 for clarity
              if (settings.format === MatchFormat.OneVsOne && !isActive && player.runs === 0 && player.balls === 0) return null;
              
              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 flex justify-between items-center ${
                    isActive && !isOut ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.02]' : isOut ? 'opacity-40 bg-gray-50 border-gray-100' : 'border-gray-50 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isActive && !isOut ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className={`font-bold text-sm ${isActive && !isOut ? 'text-green-700' : 'text-gray-700'}`}>
                        {player.name}
                      </p>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase">
                        {isOut ? (player.outMethod || 'OUT') : (isActive ? 'BATTING' : 'IN SHEDS')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bungee text-xl ${isActive && !isOut ? 'text-green-600' : 'text-gray-800'}`}>
                      {player.runs}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">
                      {player.balls} Balls
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 p-5 bg-blue-50 rounded-3xl border border-blue-100">
            <h4 className="font-bold text-blue-700 text-[10px] uppercase tracking-widest mb-3">Live Match Info</h4>
            <div className="flex flex-wrap gap-2">
              <span className="text-[9px] bg-white text-blue-800 px-3 py-1 rounded-full font-bold border border-blue-200 uppercase">
                {settings.format} Mode
              </span>
              <span className="text-[9px] bg-white text-blue-800 px-3 py-1 rounded-full font-bold border border-blue-200 uppercase">
                {settings.wicketsPerInnings} Wickets
              </span>
              <span className="text-[9px] bg-white text-blue-800 px-3 py-1 rounded-full font-bold border border-blue-200 uppercase">
                {settings.oversPerInnings} Overs
              </span>
              {settings.specialRules.filter(r => r.enabled).map(r => (
                <span key={r.id} className="text-[9px] bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold uppercase">
                  {r.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default GameScorer;
