
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions } from "react-native";
import { gameColors, commonStyles } from "@/styles/commonStyles";
import * as Haptics from "expo-haptics";
import { Stack } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type GameState = 'idle' | 'playing' | 'choosing' | 'challenge' | 'gameOver';
type ChallengeType = 'precision' | 'timing' | 'swipe';

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

  useEffect(() => {
    console.log('Game state changed:', gameState, 'Score:', score);
  }, [gameState, score]);

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
    
    // Randomly select challenge type
    const challenges: ChallengeType[] = ['precision', 'timing', 'swipe'];
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
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
    // Shrinking target based on difficulty
    const initialSize = Math.max(200 - (difficulty * 15), 80);
    const finalSize = Math.max(100 - (difficulty * 10), 40);
    
    targetSize.setValue(initialSize);
    
    // Random position for target
    const padding = 100;
    setTargetPosition({
      x: Math.random() * (SCREEN_WIDTH - padding * 2) + padding,
      y: Math.random() * 300 + 200,
    });
    
    Animated.timing(targetSize, {
      toValue: finalSize,
      duration: Math.max(1000 - (difficulty * 50), 500),
      useNativeDriver: false,
    }).start();
  };

  const startTimingChallenge = () => {
    console.log('Starting timing challenge');
    challengeProgress.setValue(0);
    
    const duration = Math.max(1500 - (difficulty * 50), 800);
    
    Animated.timing(challengeProgress, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start();
  };

  const handleChallengeAttempt = () => {
    const elapsed = Date.now() - challengeStartTime;
    console.log('Challenge attempt - Type:', currentChallenge, 'Elapsed:', elapsed);
    
    let success = false;
    
    if (currentChallenge === 'precision') {
      // Success if tapped within time limit
      success = elapsed < Math.max(1000 - (difficulty * 50), 500);
    } else if (currentChallenge === 'timing') {
      // Success if tapped in the "sweet spot" (40-60% of progress)
      const progress = challengeProgress._value;
      success = progress >= 0.4 && progress <= 0.6;
    }
    
    if (success) {
      console.log('Challenge SUCCESS - Doubling score from', score, 'to', score * 2);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore(score * 2);
      setDifficulty(difficulty + 1);
      setGameState('choosing');
      animateScore();
    } else {
      console.log('Challenge FAILED - Game over');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      if (score > bestScore) {
        setBestScore(score);
      }
      
      setScore(0);
      setGameState('gameOver');
    }
    
    setCurrentChallenge(null);
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
        
        <View style={{ gap: 20 }}>
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: gameColors.secondary }]}
            onPress={handleStop}
          >
            <Text style={commonStyles.buttonText}>STOP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[commonStyles.button, { backgroundColor: gameColors.primary }]}
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
          <Text style={[commonStyles.subtitle, { marginBottom: 48 }]}>
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
              transform: [
                { translateX: targetSize.interpolate({
                  inputRange: [0, 200],
                  outputRange: [0, -100],
                }) },
                { translateY: targetSize.interpolate({
                  inputRange: [0, 200],
                  outputRange: [0, -100],
                }) },
              ],
            }}
          >
            <TouchableOpacity
              style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
              onPress={handleChallengeAttempt}
            >
              <Text style={[commonStyles.buttonText, { fontSize: 32 }]}>TAP</Text>
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
        inputRange: [0, 0.4, 0.5, 0.6, 1],
        outputRange: [
          gameColors.challengeActive,
          gameColors.challengeActive,
          gameColors.challengeSuccess,
          gameColors.challengeActive,
          gameColors.challengeActive,
        ],
      });
      
      return (
        <View style={commonStyles.centerContent}>
          <Text style={[commonStyles.subtitle, { marginBottom: 48 }]}>
            {instructionText}
          </Text>
          
          <View style={{
            width: SCREEN_WIDTH - 80,
            height: 60,
            backgroundColor: gameColors.card,
            borderRadius: 30,
            overflow: 'hidden',
            marginBottom: 48,
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
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={commonStyles.container}>
        {gameState === 'idle' && renderIdleScreen()}
        {gameState === 'choosing' && renderChoosingScreen()}
        {gameState === 'challenge' && renderChallengeScreen()}
        {gameState === 'gameOver' && renderGameOverScreen()}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // Additional component-specific styles if needed
});
