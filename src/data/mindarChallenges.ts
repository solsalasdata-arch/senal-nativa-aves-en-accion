import { TRIVIA_QUESTIONS } from './birdsData';

export const MINDAR_CHALLENGES = {
  0: {
    question: '¿Qué rasgo ayuda a reconocer al Chingolo?',
    options: [
      'El copete gris y el semicollar canela',
      'El antifaz oscuro y el pecho amarillo',
      'El pico enorme amarillo-anaranjado',
      'El nido de barro con forma de horno'
    ],
    correctIndex: 0,
    explanation: 'El Chingolo se reconoce por el copete gris, las franjas oscuras y el semicollar canela de la nuca.'
  },
  1: TRIVIA_QUESTIONS.find(question => question.id === 1)!,
  2: {
    question: '¿Qué sonido se asocia al canto del Benteveo?',
    options: [
      '“Bien-te-veo”',
      'Un silbido de tres notas y un trino final',
      'Un croar grave que retumba en el bosque',
      'Un llamado corto mientras construye su nido'
    ],
    correctIndex: 0,
    explanation: 'Su nombre común recuerda su llamado trisilábico. También puede escucharse como “bicho-feo”.'
  },
  3: {
    question: '¿Cómo construye su nido el Hornero?',
    options: [
      'Moldea barro y forma una estructura parecida a un horno',
      'Cose hojas grandes con fibras vegetales',
      'Excava una galería profunda en la arena',
      'Ocupa cavidades húmedas entre las rocas'
    ],
    correctIndex: 0,
    explanation: 'El Hornero arma su nido con barro, en una forma redondeada que recuerda a un horno.'
  }
} as const;

export type MindARChallenge = (typeof MINDAR_CHALLENGES)[keyof typeof MINDAR_CHALLENGES];
