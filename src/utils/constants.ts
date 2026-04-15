export const ET_LIST = ['RIVET', 'ESET', 'WESO', 'NET', 'CET'];

export const MINISTRY_LIST = [
  'Praise & Worship',
  'Choir',
  'Instrumentalists (Wananzambe)',
  'High School',
  'Church School',
  'Creativity',
  'Intercessory',
  'Ushering & Hospitality',
  'Compassion & Counseling'
];

export const parseMinistries = (dbString: string | undefined): string[] => {
  if (!dbString) return [];
  const s = dbString.toLowerCase();
  const matched: string[] = [];
  if (s.includes('pw') || s.includes('praise')) matched.push('Praise & Worship');
  if (s.includes('choir')) matched.push('Choir');
  if (s.includes('wananzambe') || s.includes('instrumental')) matched.push('Instrumentalists (Wananzambe)');
  if (s.includes('hs') || s.includes('high school')) matched.push('High School');
  if (s.includes('cs') || s.includes('church school')) matched.push('Church School');
  if (s.includes('creativity') || s.includes('creative')) matched.push('Creativity');
  if (s.includes('intercessor')) matched.push('Intercessory');
  if (s.includes('usher')) matched.push('Ushering & Hospitality');
  if (s.includes('compassion') || s.includes('counsel')) matched.push('Compassion & Counseling');
  return matched;
};

export const parseEts = (dbString: string | undefined): string[] => {
  if (!dbString) return [];
  const s = dbString.toLowerCase();
  const matched: string[] = [];
  if (s.includes('rivet')) matched.push('RIVET');
  if (s.includes('ecet') || s.includes('eset')) matched.push('ESET');
  if (s.includes('weso')) matched.push('WESO');
  // Need exact match boundaries for short acronyms if possible, or simple includes.
  // Using simple includes but mitigating conflict: ecet contains cet, net is unique
  if (s.includes('net')) matched.push('NET');
  if (s.match(/\bcet\b/) || s === 'cet' || s.includes('cet') && !s.includes('ecet')) matched.push('CET');
  return matched;
};
