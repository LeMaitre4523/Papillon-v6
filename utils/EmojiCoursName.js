function getClosestGradeEmoji(subjectName) {
  const gradeEmojiList = {
    numerique: '💻',
    travaux: '⚒',
    travail:'💼',
    moral: '⚖️',
    env:'🌿',
    sport: '🏀',
    econo: '📈',
    francais: '📚',
    anglais: '🇬🇧',
    allemand: '🇩🇪',
    espagnol: '🇪🇸',
    latin: '🏛️',
    italien: '🇮🇹',
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
