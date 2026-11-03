/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LevelConfig, MathQuestion, PlayerStats, SoundSettings, StudentProfile } from './types/game';
import { GAME_LEVELS } from './data/levels';
import {
  loadPlayerStats,
  savePlayerStats,
  loadSoundSettings,
  saveSoundSettings,
  loadQuestions,
  saveQuestions,
  resetAllData,
} from './utils/storage';
import { getCurrentStudent, saveCurrentStudent } from './utils/studentDatabase';
import { soundManager } from './utils/audio';
import { MainMenu } from './components/MainMenu';
import { LevelSelect } from './components/LevelSelect';
import { GameCanvas } from './components/GameCanvas';
import { GuideModal } from './components/GuideModal';
import { SettingsModal } from './components/SettingsModal';
import { TeacherModeModal } from './components/TeacherModeModal';
import { SpecialMissionModal } from './components/SpecialMissionModal';
import { StudentProfileModal } from './components/StudentProfileModal';

type AppScreen = 'MENU' | 'LEVEL_SELECT' | 'PLAYING';

export default function App() {
  // Persistence state
  const [stats, setStats] = useState<PlayerStats>(loadPlayerStats);
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(loadSoundSettings);
  const [questions, setQuestions] = useState<MathQuestion[]>(loadQuestions);
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(getCurrentStudent);

  // App navigation state
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('MENU');
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig>(GAME_LEVELS[0]);

  // Modal states
  const [showGuide, setShowGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTeacherMode, setShowTeacherMode] = useState(false);
  const [showSpecialMission, setShowSpecialMission] = useState(false);
  const [showStudentProfile, setShowStudentProfile] = useState(false);

  // Sync sound settings to soundManager on change
  useEffect(() => {
    soundManager.setSettings(soundSettings);
  }, [soundSettings]);

  // Stats updater
  const handleUpdateStats = (newStats: PlayerStats) => {
    setStats(newStats);
    savePlayerStats(newStats);
  };

  // Sound settings updater
  const handleUpdateSoundSettings = (newSettings: SoundSettings) => {
    setSoundSettings(newSettings);
    saveSoundSettings(newSettings);
  };

  // Quick sound toggle
  const handleToggleSound = () => {
    const isCurrentlyMuted = !soundSettings.bgmEnabled && !soundSettings.sfxEnabled;
    const updated = {
      ...soundSettings,
      bgmEnabled: isCurrentlyMuted,
      sfxEnabled: isCurrentlyMuted,
    };
    handleUpdateSoundSettings(updated);
  };

  // Questions updater (from Teacher Mode)
  const handleSaveQuestions = (updated: MathQuestion[]) => {
    setQuestions(updated);
    saveQuestions(updated);
  };

  // Reset entire progress
  const handleResetData = () => {
    resetAllData();
    const freshStats = loadPlayerStats();
    const freshSettings = loadSoundSettings();
    const freshQuestions = loadQuestions();
    setStats(freshStats);
    setSoundSettings(freshSettings);
    setQuestions(freshQuestions);
  };

  // Level Selection & Navigation
  const handleStartAdventure = () => {
    if (!currentStudent) {
      setShowStudentProfile(true);
      return;
    }
    // Start at current highest unlocked level
    const targetLevel = GAME_LEVELS.find((l) => l.id === stats.unlockedLevel) || GAME_LEVELS[0];
    setSelectedLevel(targetLevel);
    setCurrentScreen('PLAYING');
  };

  const handleSelectLevel = (level: LevelConfig) => {
    if (!currentStudent) {
      setShowStudentProfile(true);
      return;
    }
    setSelectedLevel(level);
    setCurrentScreen('PLAYING');
  };

  const handleSelectNextLevel = (nextLevelId: number) => {
    const nextLevel = GAME_LEVELS.find((l) => l.id === nextLevelId);
    if (nextLevel) {
      setSelectedLevel(nextLevel);
    } else {
      setCurrentScreen('LEVEL_SELECT');
    }
  };

  return (
    <div className="w-full min-h-screen bg-sky-400 font-sans select-none text-slate-800">
      {/* 1. MAIN MENU SCREEN */}
      {currentScreen === 'MENU' && (
        <MainMenu
          stats={stats}
          currentStudent={currentStudent}
          onOpenStudentProfile={() => setShowStudentProfile(true)}
          onStartAdventure={handleStartAdventure}
          onOpenLevelSelect={() => setCurrentScreen('LEVEL_SELECT')}
          onOpenGuide={() => setShowGuide(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenTeacherMode={() => setShowTeacherMode(true)}
          onOpenSpecialMission={() => {
            if (!currentStudent) {
              setShowStudentProfile(true);
            } else {
              setShowSpecialMission(true);
            }
          }}
        />
      )}

      {/* 2. LEVEL SELECT SCREEN */}
      {currentScreen === 'LEVEL_SELECT' && (
        <LevelSelect
          stats={stats}
          onSelectLevel={handleSelectLevel}
          onBack={() => setCurrentScreen('MENU')}
        />
      )}

      {/* 3. ACTIVE PLAYING CANVAS SCREEN */}
      {currentScreen === 'PLAYING' && (
        <GameCanvas
          level={selectedLevel}
          allQuestions={questions}
          stats={stats}
          currentStudent={currentStudent}
          soundSettings={soundSettings}
          onUpdateStats={handleUpdateStats}
          onToggleSound={handleToggleSound}
          onBackToMenu={() => {
            soundManager.stopBGM();
            setCurrentScreen('MENU');
          }}
          onSelectNextLevel={handleSelectNextLevel}
        />
      )}

      {/* MODALS */}
      {showStudentProfile && (
        <StudentProfileModal
          currentStudent={currentStudent}
          onSave={(updatedStudent) => {
            setCurrentStudent(updatedStudent);
            saveCurrentStudent(updatedStudent);
          }}
          onClose={() => setShowStudentProfile(false)}
        />
      )}

      {showSpecialMission && (
        <SpecialMissionModal
          stats={stats}
          currentStudent={currentStudent}
          onUpdateStats={handleUpdateStats}
          onPlayInPlatformer={() => {
            setShowSpecialMission(false);
            const level5 = GAME_LEVELS.find((l) => l.id === 5) || GAME_LEVELS[0];
            handleSelectLevel(level5);
          }}
          onClose={() => setShowSpecialMission(false)}
        />
      )}

      {showGuide && (
        <GuideModal onClose={() => setShowGuide(false)} />
      )}

      {showSettings && (
        <SettingsModal
          settings={soundSettings}
          onUpdateSettings={handleUpdateSoundSettings}
          onResetData={handleResetData}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showTeacherMode && (
        <TeacherModeModal
          questions={questions}
          stats={stats}
          onSaveQuestions={handleSaveQuestions}
          onClose={() => setShowTeacherMode(false)}
        />
      )}
    </div>
  );
}
