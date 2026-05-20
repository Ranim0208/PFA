"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const StackContext = createContext({
  items: [],
  push: (p0) => {},
  pop: () => {},
});

export const useStack = () => {
  const context = useContext(StackContext);
  if (!context) {
    throw new Error("useStack must be used within a StackProvider");
  }
  return context;
};

export default function StackProvider({ children }) {
  const [stack, setStack] = useState([]);

  const push = useCallback((element) => {
    setStack((prev) => [...prev, element]);
  }, []);

  const pop = useCallback(() => {
    setStack((prev) => prev.slice(0, -1));
  }, []);

  const value = useMemo(
    () => ({ items: stack, push, pop }),
    [stack, push, pop]
  );

  return (
    <StackContext.Provider value={value}>{children}</StackContext.Provider>
  );
}
