import React, { useState, useEffect, useRef } from 'react';
import Wheel from './Wheel';
import { COMPANIES, CONDITIONS } from './constants';
import './index.css';
import ChallengeModal from './ChallengeModal';
import { Repeat } from 'lucide-react';

const App = () => {
  const [usedCompanies, setUsedCompanies] = useState(() => {
    const saved = localStorage.getItem('usedCompanies');
    return saved ? JSON.parse(saved) : Array(20).fill(false).map((_, i) => ({
      label: COMPANIES[i],
      revealed: false,
      used: false
    }));
  });

  const [usedConditions, setUsedConditions] = useState(() => {
    const saved = localStorage.getItem('usedConditions');
    return saved ? JSON.parse(saved) : Array(20).fill(false).map((_, i) => ({
      label: CONDITIONS[i],
      revealed: false,
      used: false
    }));
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const companyWheelRef = useRef(null);
  const conditionWheelRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('usedCompanies', JSON.stringify(usedCompanies));
  }, [usedCompanies]);

  useEffect(() => {
    localStorage.setItem('usedConditions', JSON.stringify(usedConditions));
  }, [usedConditions]);

  const companiesCount = usedCompanies.filter(c => c.used).length;
  const conditionsCount = usedConditions.filter(c => c.used).length;

  const allUsed = companiesCount === 20;

  const handleSpin = async () => {
    if (isSpinning || allUsed) return;
    setIsSpinning(true);

    // Filter available indices
    const availableCompanyIndices = usedCompanies
      .map((c, i) => c.used ? -1 : i)
      .filter(i => i !== -1);

    if (availableCompanyIndices.length === 0) {
      setIsSpinning(false);
      return;
    }

    const targetCompanyIndex = availableCompanyIndices[Math.floor(Math.random() * availableCompanyIndices.length)];

    // Spin Company Wheel
    await companyWheelRef.current.spin(targetCompanyIndex);

    // Update Company State
    setUsedCompanies(prev => {
      const next = [...prev];
      next[targetCompanyIndex].revealed = true;
      next[targetCompanyIndex].used = true;
      return next;
    });

    // Short delay before next spin
    await new Promise(r => setTimeout(r, 1000));

    // Filter available condition indices
    const availableConditionIndices = usedConditions
      .map((c, i) => c.used ? -1 : i)
      .filter(i => i !== -1);

    const targetConditionIndex = availableConditionIndices[Math.floor(Math.random() * availableConditionIndices.length)];

    // Spin Condition Wheel
    await conditionWheelRef.current.spin(targetConditionIndex);

    // Update Condition State
    setUsedConditions(prev => {
      const next = [...prev];
      next[targetConditionIndex].revealed = true;
      next[targetConditionIndex].used = true;
      return next;
    });

    // Show Challenge Modal
    setTimeout(() => {
      setCurrentChallenge({
        company: COMPANIES[targetCompanyIndex],
        condition: CONDITIONS[targetConditionIndex]
      });
    }, 500);

    setIsSpinning(false);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the entire event? All progress will be lost.")) {
      const resetCompanies = Array(20).fill(false).map((_, i) => ({
        label: COMPANIES[i],
        revealed: false,
        used: false
      }));
      const resetConditions = Array(20).fill(false).map((_, i) => ({
        label: CONDITIONS[i],
        revealed: false,
        used: false
      }));

      // Visually reset wheels
      companyWheelRef.current?.reset();
      conditionWheelRef.current?.reset();

      setUsedCompanies(resetCompanies);
      setUsedConditions(resetConditions);
      localStorage.removeItem('usedCompanies');
      localStorage.removeItem('usedConditions');
      // window.location.reload(); // Removed to allow smooth reset without reload
    }
  };

  return (
    <div className="app-container">
      <div className="spotlight" />

      <header className="header">
        <h1 className="title">SPIN & SOLVE</h1>
        <p className="subtitle">THE ULTIMATE DESIGN CHALLENGE</p>
      </header>

      <main className="main-section">
        <div className="wheel-side">
          <Wheel
            ref={companyWheelRef}
            id="company"
            type="COMPANY"
            items={usedCompanies}
            onSpinEnd={() => { }}
          />
        </div>

        <div className="center-controls">
          <button
            className="play-btn"
            onClick={handleSpin}
            disabled={isSpinning || allUsed}
          >
            {isSpinning ? "???" : "PLAY"}
          </button>
          <div className="play-btn-label">SPIN THE WHEELS</div>
          {allUsed && (
            <div style={{ color: '#FF0000', fontWeight: 'bold', marginTop: '10px' }}>
              All companies used. Reset event.
            </div>
          )}
        </div>

        <div className="wheel-side">
          <Wheel
            ref={conditionWheelRef}
            id="condition"
            type="CONDITION"
            items={usedConditions}
            onSpinEnd={() => { }}
          />
        </div>
      </main>

      <footer className="footer">
        <div className="stats-group">
          <div className="stat-item">
            <span className="stat-label">COMPANIES USED</span>
            <span className="stat-value">{companiesCount} / 20</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">CONDITIONS USED</span>
            <span className="stat-value">{conditionsCount} / 20</span>
          </div>
        </div>

        <button className="reset-btn" onClick={handleReset}>
          <Repeat /> <span>RESET EVENT</span>
        </button>
      </footer>

      {currentChallenge && (
        <ChallengeModal
          challenge={currentChallenge}
          onAccept={() => setCurrentChallenge(null)}
        />
      )}
    </div>
  );
};

export default App;
