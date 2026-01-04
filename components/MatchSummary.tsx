
import React, { useState, useEffect, useRef } from 'react';
import { Innings } from '../types';

interface Props {
  innings: Innings[];
  onRestart: () => void;
}

const MatchSummary: React.FC<Props> = ({ innings, onRestart }) => {
  const [winner, setWinner] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const total1 = innings[0]?.totalScore || 0;
    const total2 = innings[1]?.totalScore || 0;
    
    if (innings.length === 1) {
        setWinner("Solo Run Completed!");
    } else {
        if (total1 > total2) setWinner("Team 1 Dominates!");
        else if (total2 > total1) setWinner("Team 2 Victory!");
        else setWinner("Honours Even - A Draw!");
    }
  }, [innings]);

  const handleShare = async () => {
    const total1 = innings[0]?.totalScore || 0;
    const total2 = innings[1]?.totalScore || 0;
    const text = `🏏 Backyard Bash Result: ${winner}\nInnings 1: ${total1}\nInnings 2: ${total2}\nScored with Backyard Bash App!`;
    
    const shareData: any = {
      title: 'Backyard Cricket Result',
      text: text,
    };

    // Only include URL if it is a valid web address (http/https)
    // Environments like sandboxes often use "about:srcdoc" or "file://" which cause Navigator.share to throw "Invalid URL"
    const currentUrl = window.location.href;
    if (currentUrl.startsWith('http')) {
      shareData.url = currentUrl;
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed', err);
        // Fallback to clipboard if sharing fails (e.g. user cancels or environment issues)
        copyToClipboard(text);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      copyToClipboard(text);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Match report copied to clipboard!');
    } catch (err) {
      console.error('Clipboard copy failed', err);
      alert('Could not copy report. Try manual selection.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in zoom-in duration-500">
      <div className="text-center">
        <h2 className="text-5xl font-bungee text-green-600 mb-2">Match Over!</h2>
        <p className="text-xl font-bold text-gray-600">{winner}</p>
      </div>

      <div 
        ref={reportRef}
        className="bg-white rounded-[2rem] p-8 shadow-2xl border-t-8 border-green-500 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <i className="fas fa-trophy text-9xl text-green-500 transform rotate-12"></i>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h3 className="text-2xl font-bungee text-gray-800">Match Report Card</h3>
            <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Official Backyard Score</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {innings.map((inn, i) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-lg font-bungee text-gray-500">Innings {i + 1}</h4>
                  <p className="text-3xl font-bungee text-green-600">{inn.totalScore}<span className="text-sm opacity-50">/{inn.totalWickets}</span></p>
                </div>
                
                <div className="space-y-2 bg-gray-50 p-4 rounded-2xl">
                  {inn.batsmen.sort((a,b) => b.runs - a.runs).slice(0, 3).map((b, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-gray-600">{b.name}</span>
                      <span className="font-bungee">{b.runs} <span className="text-[10px] font-sans opacity-40">({b.balls})</span></span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col items-center gap-4">
            <p className="text-xs text-gray-400 italic">"The glory of the backyard lasts forever."</p>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-600 transition active:scale-95"
            >
              <i className="fas fa-share-alt"></i> Share Match Report
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <button 
          onClick={onRestart}
          className="px-12 py-5 bg-green-500 text-white rounded-2xl font-bungee text-2xl shadow-xl hover:bg-green-600 transition transform hover:scale-110 active:scale-95"
        >
          Start New Match
        </button>
      </div>
    </div>
  );
};

export default MatchSummary;
