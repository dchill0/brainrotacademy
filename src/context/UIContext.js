"use client";

import {
  createContext,
  useContext,
  useState
} from "react";

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState("learn");
  const [moduleHistory, setModuleHistory] = useState([]);

  return (
    <UIContext.Provider value={{ activeTab, setActiveTab, moduleHistory, setModuleHistory }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);