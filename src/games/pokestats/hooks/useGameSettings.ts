import { useState, useCallback } from "react";
import { STORAGE_KEYS } from "../config/constants";

export const useGameSettings = () => {
  // Force skipConfirmation and shinyBonus to true as per requirements
  const [skipConfirmation, setSkipConfirmation] = useState(true);
  const [shinyBonus, setShinyBonus] = useState(true);

  const updateSkipConfirmation = useCallback((value: boolean) => {
    // No-op or force true
    setSkipConfirmation(true);
  }, []);

  const updateShinyBonus = useCallback((value: boolean) => {
    // No-op or force true
    setShinyBonus(true);
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