import { useState, useCallback } from "react";
import { STORAGE_KEYS } from "../config/constants";

export const useGameSettings = () => {
  const [skipConfirmation, setSkipConfirmation] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SKIP_CONFIRMATION);
    return saved === "true";
  });

  const [shinyBonus, setShinyBonus] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHINY_BONUS);
    return saved === "true";
  });

  const updateSkipConfirmation = useCallback((value: boolean) => {
    setSkipConfirmation(value);
    localStorage.setItem(STORAGE_KEYS.SKIP_CONFIRMATION, value.toString());
  }, []);

  const updateShinyBonus = useCallback((value: boolean) => {
    setShinyBonus(value);
    localStorage.setItem(STORAGE_KEYS.SHINY_BONUS, value.toString());
  }, []);

  return {
    skipConfirmation,
    shinyBonus,
    updateSkipConfirmation,
    updateShinyBonus,
    setSkipConfirmation, // Exposed for initialization if needed
    setShinyBonus, // Exposed for initialization if needed
  };
};