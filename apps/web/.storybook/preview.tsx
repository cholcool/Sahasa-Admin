import '@fontsource/ibm-plex-sans-thai/400.css';
import '@fontsource/ibm-plex-sans-thai/500.css';
import '@fontsource/ibm-plex-sans-thai/600.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-datatable/styles.css';
import '@/theme/global.css';
import '@/lib/dayjs';

import { MantineProvider } from '@mantine/core';
import type { Preview } from '@storybook/react-vite';
import { theme } from '@/theme/theme';

const preview: Preview = {
  // ปุ่มสลับ light / dark บน toolbar ของ Storybook
  globalTypes: {
    colorScheme: {
      description: 'โหมดสี',
      toolbar: { icon: 'mirror', items: ['light', 'dark'], dynamicTitle: true },
    },
  },
  initialGlobals: { colorScheme: 'light' },
  decorators: [
    (Story, context) => (
      <MantineProvider theme={theme} forceColorScheme={context.globals.colorScheme}>
        <Story />
      </MantineProvider>
    ),
  ],
  parameters: {
    a11y: { test: 'todo' },
  },
};

export default preview;
