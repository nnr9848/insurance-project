import React from 'react';
import { useThemeMode } from '../context/ThemeModeContext';
import HomeModern from './HomeModern';
import HomeClassic from './HomeClassic';

export default function Home() {
  const { designMode } = useThemeMode();

  return designMode === 'modern' ? <HomeModern /> : <HomeClassic />;
}
