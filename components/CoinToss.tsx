
import React, { useState } from 'react';

interface Props {
  onComplete: (finalPlayerOrder: string[]) => void;
  playerNames: string[];
}

const CoinToss: React.FC<Props> = ({ onComplete, playerNames }) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [userChoice, setUserChoice] = useState<'Heads' | 'Tails' | null>(null);
  const [result, setResult] = useState<'Heads' | 'Tails' | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [decisionMade, setDecisionMade] = useState<boolean>(false);

  const playerCalling = playerNames[0] || 'Player 1';

  const startToss = () => {
    if (isFlipping || !userChoice) return;
    setIsFlipping(true);
    setResult(null);
    setWinner(null);

    setTimeout(() => {
      const isHeads = Math.random() > 0.5;
      const tossResult = isHeads ? 'Heads' : 'Tails';
      setResult(tossResult);
      setIsFlipping(false);
      
      if (tossResult === userChoice) {
        setWinner(playerCalling);
      } else {
        setWinner(playerNames[1] || 'Player 2');
      }
    }, 2000);
  };

  const handleDecision = (choice: 'bat' | 'bowl') => {
    const otherPlayer = playerNames.find(p => p !== winner) || 'Opponent';
    if (choice === 'bat') {
      // Winner bats first
      onComplete([winner!, otherPlayer]);
    } else {
      // Winner bowls first (Other player bats first)
      onComplete([otherPlayer, winner!]);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-[2.5rem] shadow-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="space-y-1">
        <h2 className="text-3xl font-bungee text-green-600 leading-tight">The Big Toss</h2>
        {!winner && (
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            {playerCalling}'s Call
          </p>
        )}
      </div>
      
      <div className="flex flex-col items-center justify-center py-6 min-h-[220px]">
        <div className={`relative w-32 h-32 transition-transform duration-[2000ms] preserve-3d ${isFlipping ? 'animate-flip' : ''}`}>
          {/* Coin Front */}
          <div className="absolute inset-0 bg-yellow-400 border-4 border-yellow-600 rounded-full flex items-center justify-center backface-hidden shadow-inner">
            <span className="text-4xl font-bungee text-yellow-800">H</span>
          </div>
          {/* Coin Back */}
          <div className="absolute inset-0 bg-yellow-400 border-4 border-yellow-600 rounded-full flex items-center justify-center backface-hidden rotate-y-180 shadow-inner">
            <span className="text-4xl font-bungee text-yellow-800">T</span>
          </div>
        </div>
      </div>

      {!result && !isFlipping && (
        <div className="space-y-6">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setUserChoice('Heads')}
              className={`flex-1 py-4 rounded-2xl font-bungee text-xl transition-all transform active:scale-95 ${
                userChoice === 'Heads' 
                ? 'bg-yellow-500 text-white shadow-lg ring-4 ring-yellow-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              Heads
            </button>
            <button
              onClick={() => setUserChoice('Tails')}
              className={`flex-1 py-4 rounded-2xl font-bungee text-xl transition-all transform active:scale-95 ${
                userChoice === 'Tails' 
                ? 'bg-yellow-500 text-white shadow-lg ring-4 ring-yellow-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              Tails
            </button>
          </div>

          <button 
            disabled={!userChoice}
            onClick={startToss}
            className={`w-full py-4 rounded-2xl font-bungee text-xl shadow-lg transition transform active:scale-95 ${
              userChoice ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Flip the Coin!
          </button>
        </div>
      )}

      {isFlipping && (
        <p className="text-xl font-bungee text-yellow-600 animate-pulse">Coin is in the air...</p>
      )}

      {result && winner && (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
          <p className="text-3xl font-bungee text-gray-800">It's {result}!</p>
          <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-100">
            <p className="text-lg font-bold text-green-700">
                <span className="font-bungee text-2xl block">{winner}</span>
                wins the toss!
            </p>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Choose your destiny:</p>
            <div className="flex gap-4">
              <button 
                onClick={() => handleDecision('bat')}
                className="flex-1 py-5 bg-blue-500 text-white rounded-2xl font-bungee text-xl shadow-xl hover:bg-blue-600 transition transform hover:scale-105 active:scale-95 flex flex-col items-center"
              >
                <i className="fas fa-cricket-bat-ball mb-1"></i>
                BAT FIRST
              </button>
              <button 
                onClick={() => handleDecision('bowl')}
                className="flex-1 py-5 bg-orange-500 text-white rounded-2xl font-bungee text-xl shadow-xl hover:bg-orange-600 transition transform hover:scale-105 active:scale-95 flex flex-col items-center"
              >
                <i className="fas fa-baseball mb-1"></i>
                BOWL FIRST
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        
        @keyframes flip {
          0% { transform: rotateY(0deg) translateY(0); }
          25% { transform: rotateY(900deg) translateY(-80px); }
          50% { transform: rotateY(1800deg) translateY(-120px); }
          75% { transform: rotateY(2700deg) translateY(-80px); }
          100% { transform: rotateY(3600deg) translateY(0); }
        }
        .animate-flip {
          animation: flip 2s cubic-bezier(0.45, 0.05, 0.55, 0.95);
        }
      `}</style>
    </div>
  );
};

export default CoinToss;
