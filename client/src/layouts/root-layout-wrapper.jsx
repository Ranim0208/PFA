"use client";

import { ToastContainer } from "react-toastify";

import { useStack } from "../contexts/stack";

export default function RootLayoutWrapper({ children }) {
  const stack = useStack();

  return (
    <>
      <ToastContainer />
      {children}
      {stack.items.map((item) => item)}
    </>
  );
}
