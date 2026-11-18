import { createTheme, type MantineColorsTuple } from '@mantine/core';

// Colors from _requirements/Designs/sahasa-prototype.html: --red #ab0202 (shade 7), --gold #d9a520 (shade 5)
const brandRed: MantineColorsTuple = [
  '#fbeaea',
  '#f5cfcf',
  '#eba3a2',
  '#e07573',
  '#d54d4a',
  '#c92a26',
  '#bd1512',
  '#ab0202',
  '#8f0101',
  '#7d0000',
];

const brandGold: MantineColorsTuple = [
  '#fff4d6',
  '#ffe9ad',
  '#fbdb84',
  '#f2cb5b',
  '#e8bb3b',
  '#d9a520',
  '#bf8f17',
  '#a07810',
  '#80600b',
  '#5f4707',
];

export const theme = createTheme({
  primaryColor: 'brand',
  // light ใช้ #ab0202, dark ใช้สีอ่อนลง (prototype ใช้ #e0403a)
  primaryShade: { light: 7, dark: 4 },
  colors: { brand: brandRed, gold: brandGold },
  fontFamily: '"IBM Plex Sans Thai", system-ui, sans-serif',
  headings: { fontFamily: '"IBM Plex Sans Thai", system-ui, sans-serif' },
  defaultRadius: 'md',
});
