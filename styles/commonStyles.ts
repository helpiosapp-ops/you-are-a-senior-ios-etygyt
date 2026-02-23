
import { StyleSheet } from 'react-native';

// Game color theme - Dark, minimalist, high-tension design
export const gameColors = {
  // Dark theme for premium feel
  background: '#0A0A0F',
  cardBackground: '#1A1A24',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#8B8B9E',
  
  // Action colors
  primary: '#FF3B30', // DOUBLE button - high risk red
  secondary: '#34C759', // STOP button - safe green
  accent: '#FFD60A', // Score highlight
  
  // UI elements
  card: '#1E1E2E',
  highlight: '#FFD60A',
  
  // Challenge colors
  challengeActive: '#FF3B30',
  challengeSuccess: '#34C759',
  challengeFail: '#FF3B30',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gameColors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: gameColors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: gameColors.textSecondary,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: gameColors.accent,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: gameColors.text,
  },
});
