
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions } from "react-native";
import { gameColors, commonStyles } from "@/styles/commonStyles";
import * as Haptics from "expo-haptics";

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
  const challengeProgress = useRef(new Animated.Value(0)).current;
  const targetSize = useRef(new Animated.Value(200)).current;

  // Challenge state
  const [challengeStartTime, setChallengeStartTime] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const challengeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('Game state changed:', gameState, 'Score:', score);
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
    Animated.sequence([
      Animated.spring(scoreScale, {
        toValue: 1.2,
        useNativeDriver: true,
      }),
      Animated.spring(scoreScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
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
    
    // Only use precision and timing challenges (swipe removed for now)
    const challenges: ChallengeType[] = ['precision', 'timing'];
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    console.log('Selected challenge type:', randomChallenge);
    
    setCurrentChallenge(randomChallenge);
    setGameState('challenge');
    setChallengeStartTime(Date.now());
    
    // Start challenge animation based on type
    if (randomChallenge === 'precision') {
      startPrecisionChallenge();
    } else if (randomChallenge === 'timing') {
      startTimingChallenge();
    }
  };

  const startPrecisionChallenge = () => {
    console.log('Starting precision challenge');
    
    // Clear any existing timeout
    if (challengeTimeoutRef.current) {
      clearTimeout(challengeTimeoutRef.current);
    }
    
    // Shrinking target based on difficulty
    const initialSize = Math.max(200 - (difficulty * 15), 100);
    const finalSize = Math.max(120 - (difficulty * 10), 60);
    const duration = Math.max(2000 - (difficulty * 100), 1000);
    
    targetSize.setValue(initialSize);
    
    // Random position for target - ensure it's visible on screen
    const padding = 50;
    const maxX = SCREEN_WIDTH - initialSize - padding;
    const maxY = SCREEN_HEIGHT - initialSize - padding - 200; // Account for bottom UI
    
    setTargetPosition({
      x: Math.random() * maxX + padding,
      y: Math.random() * (maxY - 200) + 200, // Keep it in middle area
    });
    
    console.log('Target position:', { x: targetPosition.x, y: targetPosition.y, initialSize, finalSize, duration });
    
    Animated.timing(targetSize, {
      toValue: finalSize,
      duration: duration,
      useNativeDriver: false,
    }).start();
    
    // Auto-fail after duration + 500ms if not tapped
    challengeTimeoutRef.current = setTimeout(() => {
      console.log('Precision challenge timed out');
      handleChallengeFail();
    }, duration + 500);
  };

  const startTimingChallenge = () => {
    console.log('Starting timing challenge');
    
    // Clear any existing timeout
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
    
    // Auto-fail after duration + 200ms if not tapped
    challengeTimeoutRef.current = setTimeout(() => {
      console.log('Timing challenge timed out');
      handleChallengeFail();
    }, duration + 200);
  };

  const handleChallengeAttempt = () => {
    // Clear timeout since user attempted
    if (challengeTimeoutRef.current) {
      clearTimeout(challengeTimeoutRef.current);
      challengeTimeoutRef.current = null;
    }
    
    const elapsed = Date.now() - challengeStartTime;
    console.log('Challenge attempt - Type:', currentChallenge, 'Elapsed:', elapsed);
    
    let success = false;
    
    if (currentChallenge === 'precision') {
      // Success if tapped (since they tapped the target)
      const maxDuration = Math.max(2000 - (difficulty * 100), 1000);
      success = elapsed < maxDuration + 500;
      console.log('Precision check - elapsed:', elapsed, 'maxDuration:', maxDuration, 'success:', success);
    } else if (currentChallenge === 'timing') {
      // Success if tapped in the "sweet spot" (35-65% of progress)
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
    const subtitleText = "Tap to start";
    const bestScoreLabel = "Best Score";
    const bestScoreValue = bestScore.toString();
    
    return (
      <View style={commonStyles.centerContent}>
        <Text style={commonStyles.title}>{titleText}</Text>
        <Text style={[commonStyles.subtitle, { marginTop: 16, marginBottom: 48 }]}>
          {subtitleText}
        </Text>
        
        {bestScore > 0 && (
          <View style={{ marginBottom: 48 }}>
            <Text style={[commonStyles.subtitle, { marginBottom: 8 }]}>
              {bestScoreLabel}
            </Text>
            <Text style={[commonStyles.scoreText, { fontSize: 48 }]}>
              {bestScoreValue}
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          style={[commonStyles.button, { backgroundColor: gameColors.primary }]}
          onPress={startGame}
        >
          <Text style={commonStyles.buttonText}>START</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderChoosingScreen = () => {
    const currentScoreLabel = "Current Score";
    const scoreValue = score.toString();
    const questionText = "What will you do?";
    
    return (
      <View style={commonStyles.centerContent}>
        <Text style={commonStyles.subtitle}>{currentScoreLabel}</Text>
        <Animated.Text 
          style={[
            commonStyles.scoreText, 
            { 
              transform: [{ scale: scoreScale }],
              marginVertical: 24,
            }
          ]}
        >
          {scoreValue}
        </Animated.Text>
        
        <Text style={[commonStyles.subtitle, { marginBottom: 48 }]}>
          {questionText}
        </Text>
        
        <View style={{ gap: 20, width: '80%' }}>
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: gameColors.secondary, width: '100%' }]}
            onPress={handleStop}
          >
            <Text style={commonStyles.buttonText}>STOP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: gameColors.primary, width: '100%' }]}
            onPress={handleDouble}
          >
            <Text style={commonStyles.buttonText}>DOUBLE</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderChallengeScreen = () => {
    if (currentChallenge === 'precision') {
      const instructionText = "TAP THE TARGET!";
      
      return (
        <View style={commonStyles.centerContent}>
          <Text style={[commonStyles.subtitle, { position: 'absolute', top: 100, fontSize: 24, fontWeight: 'bold', color: gameColors.text }]}>
            {instructionText}
          </Text>
          
          <Animated.View
            style={{
              position: 'absolute',
              left: targetPosition.x,
              top: targetPosition.y,
              width: targetSize,
              height: targetSize,
              borderRadius: 1000,
              backgroundColor: gameColors.challengeActive,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 1000 }}
              onPress={handleChallengeAttempt}
              activeOpacity={0.7}
            >
              <Text style={[commonStyles.buttonText, { fontSize: 24 }]}>TAP</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      );
    }
    
    if (currentChallenge === 'timing') {
      const instructionText = "TAP IN THE GREEN ZONE!";
      
      const barWidth = challengeProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, SCREEN_WIDTH - 80],
      });
      
      const barColor = challengeProgress.interpolate({
        inputRange: [0, 0.35, 0.4, 0.6, 0.65, 1],
        outputRange: [
          gameColors.challengeActive,
          gameColors.challengeActive,
          gameColors.challengeSuccess,
          gameColors.challengeSuccess,
          gameColors.challengeActive,
          gameColors.challengeActive,
        ],
      });
      
      return (
        <View style={commonStyles.centerContent}>
          <Text style={[commonStyles.subtitle, { marginBottom: 48, fontSize: 24, fontWeight: 'bold', color: gameColors.text }]}>
            {instructionText}
          </Text>
          
          <View style={{
            width: SCREEN_WIDTH - 80,
            height: 80,
            backgroundColor: gameColors.card,
            borderRadius: 40,
            overflow: 'hidden',
            marginBottom: 48,
            borderWidth: 3,
            borderColor: gameColors.textSecondary,
          }}>
            <Animated.View
              style={{
                width: barWidth,
                height: '100%',
                backgroundColor: barColor,
              }}
            />
          </View>
          
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: gameColors.primary, width: SCREEN_WIDTH - 80 }]}
            onPress={handleChallengeAttempt}
            activeOpacity={0.7}
          >
            <Text style={commonStyles.buttonText}>TAP NOW!</Text>
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
    
    return (
      <View style={commonStyles.centerContent}>
        <Text style={[commonStyles.title, { color: gameColors.primary, marginBottom: 24 }]}>
          {gameOverText}
        </Text>
        
        <Text style={commonStyles.subtitle}>{finalScoreLabel}</Text>
        <Text style={[commonStyles.scoreText, { marginVertical: 16 }]}>
          {finalScoreValue}
        </Text>
        
        <Text style={[commonStyles.subtitle, { marginTop: 24, marginBottom: 8 }]}>
          {bestScoreLabel}
        </Text>
        <Text style={[commonStyles.scoreText, { fontSize: 36, marginBottom: 48 }]}>
          {bestScoreValue}
        </Text>
        
        <TouchableOpacity
          style={[commonStyles.button, { backgroundColor: gameColors.primary }]}
          onPress={startGame}
        >
          <Text style={commonStyles.buttonText}>PLAY AGAIN</Text>
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
  // Additional component-specific styles if needed
});
