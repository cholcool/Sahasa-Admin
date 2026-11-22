import { Anchor, type AnchorProps, Button, type ButtonProps } from '@mantine/core';
import { createLink, type LinkComponent } from '@tanstack/react-router';
import type { AnchorHTMLAttributes, Ref } from 'react';

/**
 * Mantine Anchor/Button wired to TanStack Router with typed `to` + `params`.
 * Use these instead of `component={Link}` when the route has path params.
 */
type AnchorBaseProps = AnchorProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { ref?: Ref<HTMLAnchorElement> };
type ButtonBaseProps = ButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { ref?: Ref<HTMLAnchorElement> };

const AnchorBase = (props: AnchorBaseProps) => <Anchor {...props} />;
const ButtonBase = (props: ButtonBaseProps) => <Button component="a" {...props} />;

const CreatedAnchor = createLink(AnchorBase);
const CreatedButton = createLink(ButtonBase);

export const AnchorLink: LinkComponent<typeof AnchorBase> = (props) => (
  <CreatedAnchor preload="intent" {...props} />
);
export const ButtonLink: LinkComponent<typeof ButtonBase> = (props) => (
  <CreatedButton preload="intent" {...props} />
);
