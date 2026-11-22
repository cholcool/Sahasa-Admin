import { Paper } from '@mantine/core';
import type { ReactNode } from 'react';
import classes from './ui.module.css';

/** White "paper" for print previews; stays white in dark mode like real printed output */
export function PrintPaper({ children, mono }: { children: ReactNode; mono?: boolean }) {
  return (
    <Paper
      withBorder
      p="md"
      radius="sm"
      className={mono ? classes.printPaperMono : classes.printPaper}
    >
      {children}
    </Paper>
  );
}
