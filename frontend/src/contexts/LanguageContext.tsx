import React, { createContext, useContext, useState, ReactNode } from "react";
type Lang = "en" | "bn";
const LangContext = createContext<{ lang: Lang, setLang: (l: Lang) => void }>({ lang: "en", setLang: () => {} });
export const useLang = () => useContext(LangContext);
export const LangProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("preferredLang") as Lang) || "en");
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("preferredLang", l); document.documentElement.lang = l; };
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
};
