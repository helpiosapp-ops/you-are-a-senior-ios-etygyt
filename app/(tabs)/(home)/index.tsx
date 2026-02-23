
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions } from "react-native";
import { gameColors, commonStyles } from "@/styles/commonStyles";
import * as Haptics from "expo-haptics";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type GameState = 'idle' | 'playing' | 'choosing' | 'challenge' | 'gameOver';
type ChallengeType = 'precision' | 'timing';

export default function HomeScreen() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeType | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  
  // Animation values
  const scoreScale = useRef(new Animated.Value(1)).current;
  const scoreGlow = useRef(new Animated.Value(0)).current;
  const challengeProgress = useRef(new Animated.Value(0)).current;
  const targetSize = useRef(new Animated.Value(200)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;

  // Challenge state
  const [challengeStartTime, setChallengeStartTime] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const challengeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('Game state changed:', gameState, 'Score:', score);
    
    // Pulse animation for idle state
    if (gameState === 'idle') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonPulse, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(buttonPulse, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [gameState, score]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (challengeTimeoutRef.current) {
        clearTimeout(challengeTimeoutRef.current);
      }
    };
  }, []);

  const startGame = () => {
    console.log('User tapped Start Game');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScore(1);
    setDifficulty(1);
    setGameState('choosing');
    animateScore();
  };

  const animateScore = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.spring(scoreScale, {
          toValue: 1.15,
          useNativeDriver: true,
          tension: 50,
          friction: 3,
        }),
        Animated.spring(scoreScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 5,
        }),
      ]),
      Animated.sequence([
        Animated.timing(scoreGlow, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scoreGlow, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const handleStop = () => {
    console.log('User chose STOP - Banking score:', score);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    if (score > bestScore) {
      setBestScore(score);
      console.log('New best score:', score);
    }
    
    setGameState('gameOver');
  };

  const handleDouble = () => {
    console.log('User chose DOUBLE - Starting challenge at difficulty:', difficulty);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    const challenges: ChallengeType[] = ['precision', 'timing'];
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    console.log('Selected challenge type:', randomChallenge);
    
    setCurrentChallenge(randomChallenge);
    setGameState('challenge');
    setChallengeStartTime(Date.now());
    
    if (randomChallenge === 'precision') {
      startPrecisionChallenge();
    } else if (randomChallenge === 'timing') {
      startTimingChallenge();
    }
  };

  const startPrecisionChallenge = () => {
    console.log('Starting precision challenge');
    
    if (challengeTimeoutRef.current) {
      clearTimeout(challengeTimeoutRef.current);
    }
    
    const initialSize = Math.max(200 - (difficulty * 15), 100);
    const finalSize = Math.max(120 - (difficulty * 10), 60);
    const duration = Math.max(2000 - (difficulty * 100), 1000);
    
    targetSize.setValue(initialSize);
    
    const padding = 50;
    const maxX = SCREEN_WIDTH - initialSize - padding;
    const maxY = SCREEN_HEIGHT - initialSize - padding - 200;
    
    setTargetPosition({
      x: Math.random() * maxX + padding,
      y: Math.random() * (maxY - 200) + 200,
    });
    
    console.log('Target position:', { x: targetPosition.x, y: targetPosition.y, initialSize, finalSize, duration });
    
    Animated.timing(targetSize, {
      toValue: finalSize,
      duration: duration,
      useNativeDriver: false,
    }).start();
    
    challengeTimeoutRef.current = setTimeout(() => {
      console.log('Precision challenge timed out');
      handleChallengeFail();
    }, duration + 500);
  };

  const startTimingChallenge = () => {
    console.log('Starting timing challenge');
    
    if (challengeTimeoutRef.current) {
      clearTimeout(challengeTimeoutRef.current);
    }
    
    challengeProgress.setValue(0);
    
    const duration = Math.max(2000 - (difficulty * 100), 1000);
    
    console.log('Timing challenge duration:', duration);
    
    Animated.timing(challengeProgress, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start();
    
    challengeTimeoutRef.current = setTimeout(() => {
      console.log('Timing challenge timed out');
      handleChallengeFail();
    }, duration + 200);
  };

  const handleChallengeAttempt = () => {
    if (challengeTimeoutRef.current) {
      clearTimeout(challengeTimeoutRef.current);
      challengeTimeoutRef.current = null;
    }
    
    const elapsed = Date.now() - challengeStartTime;
    console.log('Challenge attempt - Type:', currentChallenge, 'Elapsed:', elapsed);
    
    let success = false;
    
    if (currentChallenge === 'precision') {
      const maxDuration = Math.max(2000 - (difficulty * 100), 1000);
      success = elapsed < maxDuration + 500;
      console.log('Precision check - elapsed:', elapsed, 'maxDuration:', maxDuration, 'success:', success);
    } else if (currentChallenge === 'timing') {
      const progress = challengeProgress._value;
      success = progress >= 0.35 && progress <= 0.65;
      console.log('Timing check - progress:', progress, 'success:', success);
    }
    
    if (success) {
      handleChallengeSuccess();
    } else {
      handleChallengeFail();
    }
  };

  const handleChallengeSuccess = () => {
    const newScore = score * 2;
    console.log('Challenge SUCCESS - Doubling score from', score, 'to', newScore);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setScore(newScore);
    setDifficulty(difficulty + 1);
    setCurrentChallenge(null);
    setGameState('choosing');
    animateScore();
  };

  const handleChallengeFail = () => {
    console.log('Challenge FAILED - Game over');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    if (score > bestScore) {
      setBestScore(score);
    }
    
    setCurrentChallenge(null);
    setScore(0);
    setGameState('gameOver');
  };

  const renderIdleScreen = () => {
    const titleText = "STOP OR DOUBLE";
    const subtitleText = "Risk Everything to Win";
    const bestScoreLabel = "Best Score";
    const bestScoreValue = bestScore.toString();
    
    return (
      <View style={commonStyles.centerContent}>
        <View style={styles.logoContainer}>
          <Text style={[commonStyles.title, styles.glowText]}>{titleText}</Text>
          <View style={styles.accentLine} />
        </View>
        
        <Text style={[commonStyles.subtitle, { marginTop: 16, marginBottom: 64, color: gameColors.textSecondary }]}>
          {subtitleText}
        </Text>
        
        {bestScore > 0 && (
          <View style={[styles.statsCard, { marginBottom: 64 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 12, color: gameColors.textTertiary }]}>
              {bestScoreLabel}
            </Text>
            <Text style={[commonStyles.scoreText, { fontSize: 56, color: gameColors.greenPrimary }]}>
              {bestScoreValue}
            </Text>
          </View>
        )}
        
        <Animated.View style={{ transform: [{ scale: buttonPulse }] }}>
          <TouchableOpacity
            style={[styles.primaryButton, styles.glowButton]}
            onPress={startGame}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[gameColors.greenPrimary, gameColors.greenSecondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={[commonStyles.buttonText, { color: gameColors.background }]}>START GAME</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderChoosingScreen = () => {
    const currentScoreLabel = "Current Score";
    const scoreValue = score.toString();
    const questionText = "Choose Your Fate";
    const difficultyText = `Level ${difficulty}`;
    
    return (
      <View style={commonStyles.centerContent}>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{difficultyText}</Text>
        </View>
        
        <Text style={[commonStyles.subtitle, { marginTop: 32, color: gameColors.textTertiary }]}>
          {currentScoreLabel}
        </Text>
        
        <Animated.Text 
          style={[
            commonStyles.scoreText, 
            { 
              transform: [{ scale: scoreScale }],
              marginVertical: 24,
              opacity: scoreGlow.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.7],
              }),
            }
          ]}
        >
          {scoreValue}
        </Animated.Text>
        
        <Text style={[commonStyles.subtitle, { marginBottom: 64, color: gameColors.textSecondary }]}>
          {questionText}
        </Text>
        
        <View style={{ gap: 20, width: '85%', maxWidth: 400 }}>
          <TouchableOpacity
            style={[styles.secondaryButton]}
            onPress={handleStop}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={[commonStyles.buttonText, { color: gameColors.text, fontSize: 18 }]}>STOP</Text>
              <Text style={[styles.buttonSubtext, { color: gameColors.textSecondary }]}>Bank your score</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.primaryButton, styles.glowButton]}
            onPress={handleDouble}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[gameColors.greenPrimary, gameColors.greenSecondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <View style={styles.buttonContent}>
                <Text style={[commonStyles.buttonText, { color: gameColors.background, fontSize: 18 }]}>DOUBLE</Text>
                <Text style={[styles.buttonSubtext, { color: gameColors.background, opacity: 0.7 }]}>Risk it all</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderChallengeScreen = () => {
    if (currentChallenge === 'precision') {
      const instructionText = "TAP THE TARGET";
      
      return (
        <View style={commonStyles.centerContent}>
          <View style={styles.challengeHeader}>
            <Text style={[commonStyles.subtitle, { fontSize: 20, fontWeight: '700', color: gameColors.text }]}>
              {instructionText}
            </Text>
          </View>
          
          <Animated.View
            style={{
              position: 'absolute',
              left: targetPosition.x,
              top: targetPosition.y,
              width: targetSize,
              height: targetSize,
              borderRadius: 1000,
              backgroundColor: gameColors.greenPrimary,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: gameColors.greenPrimary,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 30,
              elevation: 15,
            }}
          >
            <TouchableOpacity
              style={{ 
                width: '100%', 
                height: '100%', 
                justifyContent: 'center', 
                alignItems: 'center', 
                borderRadius: 1000,
                borderWidth: 4,
                borderColor: gameColors.background,
              }}
              onPress={handleChallengeAttempt}
              activeOpacity={0.7}
            >
              <Text style={[commonStyles.buttonText, { fontSize: 28, color: gameColors.background }]}>TAP</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      );
    }
    
    if (currentChallenge === 'timing') {
      const instructionText = "TAP IN THE GREEN ZONE";
      
      const barWidth = challengeProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, SCREEN_WIDTH - 80],
      });
      
      const barColor = challengeProgress.interpolate({
        inputRange: [0, 0.35, 0.4, 0.6, 0.65, 1],
        outputRange: [
          gameColors.textTertiary,
          gameColors.textTertiary,
          gameColors.greenPrimary,
          gameColors.greenPrimary,
          gameColors.textTertiary,
          gameColors.textTertiary,
        ],
      });
      
      return (
        <View style={commonStyles.centerContent}>
          <View style={styles.challengeHeader}>
            <Text style={[commonStyles.subtitle, { fontSize: 20, fontWeight: '700', color: gameColors.text }]}>
              {instructionText}
            </Text>
          </View>
          
          <View style={styles.timingBarContainer}>
            <View style={styles.timingBarTrack}>
              <Animated.View
                style={{
                  width: barWidth,
                  height: '100%',
                  backgroundColor: barColor,
                  borderRadius: 50,
                  shadowColor: gameColors.greenPrimary,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 20,
                }}
              />
            </View>
            
            <View style={styles.greenZoneIndicator}>
              <View style={styles.greenZoneMarker} />
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.primaryButton, styles.glowButton, { width: SCREEN_WIDTH - 80, marginTop: 48 }]}
            onPress={handleChallengeAttempt}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[gameColors.greenPrimary, gameColors.greenSecondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={[commonStyles.buttonText, { color: gameColors.background }]}>TAP NOW</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }
    
    return null;
  };

  const renderGameOverScreen = () => {
    const gameOverText = "GAME OVER";
    const finalScoreLabel = "Final Score";
    const finalScoreValue = score.toString();
    const bestScoreLabel = "Best Score";
    const bestScoreValue = bestScore.toString();
    const isNewBest = score === bestScore && score > 0;
    const newBestText = "NEW BEST!";
    
    return (
      <View style={commonStyles.centerContent}>
        <Text style={[commonStyles.title, { color: gameColors.danger, fontSize: 48, marginBottom: 32 }]}>
          {gameOverText}
        </Text>
        
        {isNewBest && (
          <View style={styles.newBestBadge}>
            <Text style={styles.newBestText}>{newBestText}</Text>
          </View>
        )}
        
        <View style={[styles.statsCard, { marginBottom: 24 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 12, color: gameColors.textTertiary }]}>
            {finalScoreLabel}
          </Text>
          <Text style={[commonStyles.scoreText, { fontSize: 72 }]}>
            {finalScoreValue}
          </Text>
        </View>
        
        <View style={[styles.statsCard, { marginBottom: 64, backgroundColor: gameColors.surfaceElevated }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 12, color: gameColors.textTertiary }]}>
            {bestScoreLabel}
          </Text>
          <Text style={[commonStyles.scoreText, { fontSize: 48, color: gameColors.scoreGold }]}>
            {bestScoreValue}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.primaryButton, styles.glowButton]}
          onPress={startGame}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[gameColors.greenPrimary, gameColors.greenSecondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Text style={[commonStyles.buttonText, { color: gameColors.background }]}>PLAY AGAIN</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={commonStyles.container}>
      {gameState === 'idle' && renderIdleScreen()}
      {gameState === 'choosing' && renderChoosingScreen()}
      {gameState === 'challenge' && renderChallengeScreen()}
      {gameState === 'gameOver' && renderGameOverScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
  },
  glowText: {
    textShadowColor: gameColors.glowShadow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  accentLine: {
    width: 120,
    height: 4,
    backgroundColor: gameColors.greenPrimary,
    marginTop: 16,
    borderRadius: 2,
    shadowColor: gameColors.greenPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  statsCard: {
    backgroundColor: gameColors.card,
    borderRadius: 24,
    padding: 32,
    minWidth: 280,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: gameColors.cardBorder,
    shadowColor: gameColors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButton: {
    borderRadius: 20,
    overflow: 'hidden',
    minWidth: 240,
  },
  secondaryButton: {
    backgroundColor: gameColors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: gameColors.cardBorder,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: gameColors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  glowButton: {
    shadowColor: gameColors.greenPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  gradientButton: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    alignItems: 'center',
  },
  buttonSubtext: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  difficultyBadge: {
    backgroundColor: gameColors.surfaceElevated,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: gameColors.cardBorder,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '700',
    color: gameColors.greenPrimary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  challengeHeader: {
    position: 'absolute',
    top: 100,
    backgroundColor: gameColors.surfaceElevated,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: gameColors.cardBorder,
  },
  timingBarContainer: {
    width: SCREEN_WIDTH - 80,
    alignItems: 'center',
  },
  timingBarTrack: {
    width: '100%',
    height: 80,
    backgroundColor: gameColors.card,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: gameColors.cardBorder,
    shadowColor: gameColors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  greenZoneIndicator: {
    position: 'absolute',
    left: '35%',
    width: '30%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenZoneMarker: {
    width: '100%',
    height: '100%',
    borderWidth: 3,
    borderColor: gameColors.greenPrimary,
    borderRadius: 50,
    opacity: 0.3,
  },
  newBestBadge: {
    backgroundColor: gameColors.greenPrimary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: gameColors.greenPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  newBestText: {
    fontSize: 16,
    fontWeight: '900',
    color: gameColors.background,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
