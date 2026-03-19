import { useEffect, useState } from "react";

export const useDarkMode = () => {
  const [dark, setDark] = useState(
    () => localStorage.getItem("ak_admin_dark") === "1"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("ak_admin_dark", "1");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("ak_admin_dark", "0");
    }
  }, [dark]);

  return [dark, setDark];
};

