"use client";

import { useState, useLayoutEffect } from "react";
import Learn from "./Learn";
import Compete from "./Compete";

export default function MainTabs({ user, activeTab, setActiveTab, moduleHistory, setModuleHistory }) {
  const [learnScroll, setLearnScroll] = useState(0);
  const [competeScroll, setCompeteScroll] = useState(0);

  const handleTabClick = (tab) => {
    if (activeTab === "learn") {
      setLearnScroll(window.scrollY);
    } else {
      setCompeteScroll(window.scrollY);
    }
    setActiveTab(tab);
  };

  useLayoutEffect(() => {
    if (activeTab === "learn") {
      window.scrollTo(0, learnScroll);
    } else {
      window.scrollTo(0, competeScroll);
    }
  }, [activeTab, learnScroll, competeScroll]);

  return (
    <div>
      <div style={{ display: 'flex', width: '100%', borderBottom: '2px solid #ccc', position: 'sticky', top: 0, zIndex: 999, backgroundColor: '#fff' }}>
        <button
          onClick={() => handleTabClick('learn')}
          style={{
            flex: 1, // takes equal space
            padding: '1rem 0',
            border: 'none',
            borderBottom: activeTab === 'learn' ? '4px solid blue' : '4px solid transparent',
            fontWeight: activeTab === 'learn' ? 'bold' : 'normal',
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
            borderBottom: activeTab === 'compete' ? '4px solid blue' : '4px solid transparent',
            fontWeight: activeTab === 'compete' ? 'bold' : 'normal',
            cursor: 'pointer',
          }}
        >
          Compete
        </button>
      </div>

      <div style={{ padding: '1rem 0' }}>
        {activeTab === 'learn' && <Learn user={user} moduleHistory={moduleHistory} setModuleHistory={setModuleHistory}/>}
        {activeTab === 'compete' && (
          user && user.emailVerified ? <Compete/> : <div><h2>Login or create an account to complete with others</h2></div>
        )}
      </div>
    </div>
  );
}