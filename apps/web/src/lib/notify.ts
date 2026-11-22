import { notifications } from '@mantine/notifications';

/** Success toast (prototype "data-done" / "data-toast") */
export function notifyDone(message: string) {
  notifications.show({ message, color: 'green' });
}
