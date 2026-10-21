/**
 * Chat surface colours that follow the light/dark switch.
 *
 * The seller dashboard switches schemes with CSS variables (theme/AppTheme.tsx,
 * cssVariables + colorSchemes), where theme.palette.mode stays "light" in JS
 * whatever the user picked. So never branch on palette.mode here: use
 * theme.applyStyles('dark', ...) and theme.vars, which work with and without
 * CSS variables (the storefront uses a plain theme).
 */

import { alpha, type Theme } from '@mui/material/styles';

type CssVars = { palette: Theme['palette'] & { primary: { mainChannel: string } } };

// theme.vars exists only when the theme uses CSS variables (the seller dashboard).
const varsOf = (t: Theme) => (t as unknown as { vars?: CssVars }).vars;

const pal = (t: Theme) => varsOf(t)?.palette ?? t.palette;

/** Primary colour at an opacity, live under CSS variables. */
const primaryTint = (t: Theme, opacity: number) => {
  const vars = varsOf(t);
  return vars ? `rgba(${vars.palette.primary.mainChannel} / ${opacity})` : alpha(t.palette.primary.main, opacity);
};

/** Wallpaper behind the messages. */
export const threadBg = (t: Theme) => ({
  backgroundColor: '#f2efe9',
  ...t.applyStyles('dark', { backgroundColor: pal(t).background.default }),
});

/** Empty "Select a chat" pane. */
export const emptyPaneBg = (t: Theme) => ({
  backgroundColor: '#f7f6f3',
  ...t.applyStyles('dark', { backgroundColor: pal(t).background.default }),
});

/**
 * Own message bubble. An app can set --chat-own-bubble on a wrapper to use a
 * brand colour (the storefront does: ChatBrandTheme.tsx); otherwise it is a
 * tint of the theme's primary.
 */
export const ownBubble = (t: Theme) => ({
  backgroundColor: `var(--chat-own-bubble, ${primaryTint(t, 0.14)})`,
  ...t.applyStyles('dark', { backgroundColor: `var(--chat-own-bubble-dark, ${primaryTint(t, 0.38)})` }),
});

/** The other side's bubble. */
export const otherBubble = (t: Theme) => ({ backgroundColor: pal(t).background.paper });

/** Search box / composer pill. */
export const fieldBg = (t: Theme) => ({
  backgroundColor: pal(t).grey[100],
  ...t.applyStyles('dark', { backgroundColor: pal(t).action.hover }),
});

/** The yellow "keep it on Negromart" notice. */
export const noticeBg = (t: Theme) => ({
  backgroundColor: '#fff5c4',
  ...t.applyStyles('dark', { backgroundColor: 'rgba(255, 179, 0, 0.12)' }),
});
