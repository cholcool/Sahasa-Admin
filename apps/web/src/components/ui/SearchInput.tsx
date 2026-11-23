import { CloseButton, TextInput, type TextInputProps } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import classes from './ui.module.css';

export interface SearchInputProps extends Omit<
  TextInputProps,
  'value' | 'defaultValue' | 'onChange'
> {
  /** Current search text (e.g. from the URL or page state) */
  value: string;
  /** Called while typing, after `delay` ms without a keystroke */
  onSearch: (value: string) => void;
  /** Debounce in ms; 0 = every keystroke */
  delay?: number;
}

/**
 * Search-as-you-type box used by every list page.
 * Keeps its own text so typing stays smooth, and reports the value after a short pause.
 * The X button and the Escape key clear the search at once.
 */
export function SearchInput({ value, onSearch, delay = 250, ...props }: SearchInputProps) {
  const [text, setText] = useState(value);
  const [synced, setSynced] = useState(value);
  // Follow outside changes (e.g. "ล้างตัวกรอง" or browser back) without an effect
  if (value !== synced) {
    setSynced(value);
    setText(value);
  }
  const report = useDebouncedCallback((v: string) => onSearch(v.trim()), delay);

  const clear = () => {
    report.cancel();
    setText('');
    onSearch('');
  };

  return (
    <TextInput
      classNames={{ input: classes.searchInput }}
      leftSection={<IconSearch size={16} />}
      rightSection={text ? <CloseButton size="sm" aria-label="ล้างคำค้นหา" onClick={clear} /> : null}
      {...props}
      type="search"
      value={text}
      onChange={(e) => {
        const v = e.currentTarget.value;
        setText(v);
        if (delay === 0) onSearch(v.trim());
        else report(v);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && text) {
          e.preventDefault();
          clear();
        }
        if (e.key === 'Enter') {
          report.flush();
        }
        props.onKeyDown?.(e);
      }}
    />
  );
}
