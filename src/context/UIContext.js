"use client";

import {
  createContext,
  useContext,
  useState
} from "react";

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [UIState, setUIState] = useState({ activeTab: "learn", moduleHistory: [], studyType: "practice problem", overlayOption: null });

  return (
    <UIContext.Provider value={{ UIState, setUIState }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);