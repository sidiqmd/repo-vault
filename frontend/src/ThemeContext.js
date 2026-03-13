import { createContext, useContext } from "react";
import { PDark } from "./theme";

export const ThemeContext = createContext(PDark);
export const useTheme = () => useContext(ThemeContext);
