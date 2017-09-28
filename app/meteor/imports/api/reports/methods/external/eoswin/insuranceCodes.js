import some from 'lodash/fp/some'

export const NEW = [
  '540',
  'E1',
  'E12'
]

export const SURGERY = [
  // BVA VA KFA
  'O9H', // Technisch einfache Operation größerer Geschwülste
  '09H',
  'O10H', // Technisch schwierige Operation größerer Geschwülste
  '010H',

  // SVA
  'O8H', // Lipom, Basaliom, Nävus, OP mit Naht und Histo
  '08H',
  'O8P', // PE und Naht 3 Stk pro Sitzung
  '08P',

  // WGKK
  '502' // OP Hauttumore (Histo/Naht), Exzision Nävus, Basaliom

]

export const CAUTERY = [
  // BVA VA KFA
  '26F', // Abtragen leicht zugänglicher Geschwülste oder dermaler Nävus, Fibrom
  '26D', // Exkochleation oder Ätzung oder Kaustik einer Warze, Achtung: Besser 26e verwenden!
  '38M', // Kaustik - außer Warzen genaue LOKALISATION

  'O16A', // Elektrokaustik bei Condylome und akt. Keratose/LOKALISATION
  '016A',

  // WGKK
  '503', // OP oberflächliche Geschwülste (Atherom, Fibrom, Lipom) mit jeder Methode außer scharfem Löffel (ohne Histo/Naht) - kaustik weil ohne naht

  '504', // Kaustik (außer Warzen)
  '506', // Exstirpation von Hauttumoren, z.B. mit scharfem Löffel (503 ist besser)
  '520', // Operative Behandlung von Abszessen, Furunkeln und Condylomen (egal wie)

  '534' // Operative Entfernung kleiner Geschwülste an den Lidern (egal wie)
]

export const CRYO = [
  '507', // Kroytherapie mit flüssigem Stickstoff (außer Warzen)  
  '72', //  Hühneraugen/Warzenentfernung, alle Methoden pro Sitzung (ausgenommen Excision und Naht)
  '26E', // Exkochleation oder Ätzung oder Kaustik von 3Stk. Warzen in einer Sitzung - Stickstiff
  '38R' // Keratosen
]

export const OTHER = [
  '73',
  // BVA VA KFA
  'TA',
  'E2',
  '39B',
  '38J',
  '18A',
  '18C',
  '38V',
  '38VV',
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
  '538', // "Muttermalkontrolle"
  '525',
  '25',
  'ORD',

  // Regiezuschlag etc.
  '941',
  'RI',
  '942',
  'RII',
  '542',
  'BF',
  'E2',
  '8D',
  '8E',
  '8F'
]

export const isNew = (codes) =>
  some(c => NEW.includes(c))(codes)

export const isSurgery = (codes) =>
  some(c => SURGERY.includes(c))(codes)

export const isCautery = (codes) =>
  some(c => CAUTERY.includes(c))(codes)

export const isCryo = (codes) =>
  some(c => CRYO.includes(c))(codes)

export const isOther = (codes) =>
  some(c => OTHER.includes(c))(codes)

export const isAny = (codes) =>
  isNew(codes) || isSurgery(codes) || isCautery(codes) || isCryo(codes) || isOther(codes)
