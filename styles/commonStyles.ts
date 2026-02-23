
import { StyleSheet } from 'react-native';

// Premium game color theme - Sophisticated dark with vibrant green accents
export const gameColors = {
  // Deep, rich dark backgrounds
  background: '#0B0E13',
  cardBackground: '#151922',
  surfaceElevated: '#1C2129',
  
  // Premium text hierarchy
  text: '#FFFFFF',
  textSecondary: '#8B92A3',
  textTertiary: '#5A6170',
  
  // Vibrant green accent system
  greenPrimary: '#00FF88',
  greenSecondary: '#00D970',
  greenGlow: 'rgba(0, 255, 136, 0.3)',
  greenDark: '#00B35C',
  
  // Action colors - sophisticated palette
  primary: '#00FF88', // DOUBLE button - vibrant green for risk
  secondary: '#00D970', // STOP button - safe green
  danger: '#FF4757', // Fail state
  warning: '#FFB800', // Warning state
  
  // Score and highlight colors
  accent: '#00FF88',
  accentGlow: 'rgba(0, 255, 136, 0.2)',
  scoreGold: '#FFD700',
  
  // UI elements with depth
  card: '#1C2129',
  cardBorder: 'rgba(0, 255, 136, 0.15)',
  divider: 'rgba(139, 146, 163, 0.15)',
  
  // Challenge colors
  challengeActive: '#00FF88',
  challengeSuccess: '#00FF88',
  challengeFail: '#FF4757',
  challengeNeutral: '#5A6170',
  
  // Overlay and shadow
  overlay: 'rgba(11, 14, 19, 0.85)',
  shadowColor: 'rgba(0, 0, 0, 0.5)',
  glowShadow: 'rgba(0, 255, 136, 0.4)',
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
    padding: 24,
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    color: gameColors.text,
    textAlign: 'center',
    letterSpacing: -1,
    textShadowColor: gameColors.glowShadow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: gameColors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scoreText: {
    fontSize: 96,
    fontWeight: '900',
    color: gameColors.greenPrimary,
    textAlign: 'center',
    letterSpacing: -3,
    textShadowColor: gameColors.glowShadow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  button: {
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderRadius: 20,
    minWidth: 240,
    alignItems: 'center',
    shadowColor: gameColors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '800',
    color: gameColors.background,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: gameColors.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: gameColors.cardBorder,
    shadowColor: gameColors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  glowEffect: {
    shadowColor: gameColors.greenPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
});
