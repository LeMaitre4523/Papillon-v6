function getClosestGradeEmoji(subjectName) {
  const gradeEmojiList = {
    numerique: '💻',
    SI: '💻',
    SNT: '💻',
    travaux: '⚒',
    travail:'💼',
    moral: '⚖️',
    env:'🌿',
    sport: '🏀',
    EPS: '🏀',
    econo: '📈',
    francais: '📚',
    anglais: '🇬🇧',
    allemand: '🇩🇪',
    espagnol: '🇪🇸',
    latin: '🏛️',
    italien: '🇮🇹',
    histoire: '📜',
    EMC: '🤝',
    hist: '📜',
    llc: '🌍',
    scientifique: '🔬',
    arts: '🎨',
    philosophie: '🤔',
    math: '📐',
    phys: '🧪',
    accomp: '👨‍🏫',
    tech: '🔧',
    ingenieur: '🔧',
    musique: '🎼',
    musical: '🎼',
    classe: '🏫',
    vie: '🧬',
    SES: '💰',
    stage: '👔',
    œuvre:'🖼️',
    default: '📝',
  };

  const subjectNameFormatted = subjectName
    .toLowerCase()
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // get emoji with key in subject name
  const closest = Object.keys(gradeEmojiList).reduce((a, b) =>
    subjectNameFormatted.includes(a) ? a : b
  );

  return gradeEmojiList[closest];
}

export default getClosestGradeEmoji;
