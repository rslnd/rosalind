import some from 'lodash/fp/some'

export const NEW = [
  '540',
  'E1',
  'E12'
]

export const SURGERY = [
  // BVA VA KFA
  '09H',
  '010H',

  // SVA
  '08H',
  '08P',

  // WGKK
  '502',
  '503',
  '506'
]

export const CAUTERY = [
  // BVA VA KFA
  '26D',
  '26E',
  '26F',
  '38M',
  'O16A',
  '016A',

  // WGKK
  '504',
  '507',
  '520',
  '534',
  '72',
  '73'
]

export const OTHER = [
  // BVA VA KFA
  'TA',
  'E2',
  '39B',
  '38J',
  '18A',
  '18C',
  '38V',
  '38VV',
  '38R',
  'RZI',
  'RZII',
  '15A',
  '38V',
  '38vv',
  '27L',
  '27M',
  'J1',
  '27A',
  '11Q',
  '11R',
  '17A',
  '',
  '11A',
  '11B',

  // SVA
  'TA',
  '3C',
  '38J',
  '18A',
  '18C',
  '27A',
  '27M',
  '38L',
  '38R',
  '38Y',
  '27A',
  '27L',
  '11A',

  // WGKK
  '20',
  '25',
  '501',
  '78',
  '517',
  '519',
  '536',
  '508',
  '516',
  '526',
  '527',
  '90',
  '535',
  '542',
  '538',
  '525',
  '25',
  'ORD'
]

export const isNew = (codes) =>
  some(c => NEW.includes(c))(codes)

export const isSurgery = (codes) =>
  some(c => SURGERY.includes(c))(codes)

export const isCautery = (codes) =>
  some(c => CAUTERY.includes(c))(codes)

export const isOther = (codes) =>
  some(c => OTHER.includes(c))(codes)

export const isAny = (codes) =>
  isNew(codes) || isSurgery(codes) || isCautery(codes) || isOther(codes)
