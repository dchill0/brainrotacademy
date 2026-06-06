"use client";

import { useState, useLayoutEffect } from "react";
import Learn from "./Learn";
import Compete from "./Compete";

export default function MainTabs({ user, UIState, setUIState }) {
  const [learnScroll, setLearnScroll] = useState(0);
  const [competeScroll, setCompeteScroll] = useState(0);

  const handleTabClick = (tab) => {
    if (UIState.activeTab === "learn") {
      setLearnScroll(window.scrollY);
    } else {
      setCompeteScroll(window.scrollY);
    }
    setUIState(prev => ({...prev, activeTab: tab}));
  };

  useLayoutEffect(() => {
    if (UIState.activeTab === "learn") {
      window.scrollTo(0, learnScroll);
    } else {
      window.scrollTo(0, competeScroll);
    }
  }, [UIState.activeTab, learnScroll, competeScroll]);

  return (
    <div>
      <div style={{ display: 'flex', width: '100%', borderBottom: '2px solid #ccc', position: 'sticky', top: 0, zIndex: 999, backgroundColor: '#fff' }}>
        <button
          onClick={() => handleTabClick('learn')}
          style={{
            flex: 1, // takes equal space
            padding: '1rem 0',
            border: 'none',
            borderBottom: UIState.activeTab === 'learn' ? '4px solid blue' : '4px solid transparent',
            fontWeight: UIState.activeTab === 'learn' ? 'bold' : 'normal',
            cursor: 'pointer',
          }}
        >
          Learn
        </button>
        <button
          onClick={() => handleTabClick('compete')}
          style={{
            flex: 1,
            padding: '1rem 0',
            border: 'none',
            borderBottom: UIState.activeTab === 'compete' ? '4px solid blue' : '4px solid transparent',
            fontWeight: UIState.activeTab === 'compete' ? 'bold' : 'normal',
            cursor: 'pointer',
          }}
        >
          Compete
        </button>
      </div>

      <div style={{ padding: '1rem 0' }}>
        {UIState.activeTab === 'learn' && <Learn user={user} UIState={UIState} setUIState={setUIState}/>}
        {UIState.activeTab === 'compete' && (
          user && user.emailVerified ? <Compete/> : <div><h2>Login or create an account to complete with others</h2></div>
        )}
      </div>
    </div>
  );
}