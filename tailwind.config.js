import animate from 'tailwindcss-animate'
import plugin from 'tailwindcss/plugin'
import { addIconSelectors } from '@iconify/tailwind'

// Phosphor-ikoner som referensen använder (klassnamn: "iconify ph--namn")
const phIcons = `arrow-counter-clockwise arrow-down-right arrow-down-right-bold arrow-elbow-down-left arrow-left arrow-line-down
arrow-line-right-bold arrow-right arrow-right-bold arrow-up arrow-up-right arrow-up-right-bold arrows-clockwise arrows-clockwise-bold
arrows-down-up arrows-in-line-horizontal-bold arrows-left-right arrows-left-right-bold arrows-out-simple book-open book-open-fill
caret-double-left caret-double-right caret-down caret-right-bold caret-up chart-line-bold chart-line-up chats-circle check check-bold
check-circle check-circle-fill chef-hat-bold circle circle-dashed-bold circle-half circle-notch-bold clock coins coins-fill copy
crosshair-fill cube currency-circle-dollar currency-dollar detective-fill discord-logo-bold drop-bold drop-fill envelope-open eye
eye-slash eye-slash-fill fire fire-bold fire-fill flame-fill funnel-bold git-branch git-branch-fill git-commit-bold globe-simple
globe-simple-bold hand-coins-fill handshake hourglass image-square-bold info intersect-three lightning-fill link link-break lock
lock-key-open lock-simple magnifying-glass megaphone minus-bold moon-bold note-pencil paint-brush-fill pause-circle pause-circle-fill
pause-fill play-fill plus plus-bold quotes-bold rows rows-bold seal-check-fill share-network shield-check shield-check-fill sign-out
signature sparkle-fill spinner-bold squares-four squares-four-bold squares-four-fill stack-simple star star-fill sun-bold target
telegram-logo-bold trophy-fill user-circle user-circle-fill user-focus wallet warning-circle warning-circle-fill x x-circle
x-circle-fill x-logo x-logo-bold`.split(/\s+/).filter(Boolean)

const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: { xs: '390px', sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
    borderRadius: { none: '0', sm: '0', DEFAULT: '0', md: '0', lg: '0', xl: '0', '2xl': '0', '3xl': '0', full: '9999px' },
    extend: {
      colors: {
        background: v('background'),
        foreground: v('foreground'),
        panel: v('panel'),
        neutral: {
          50: v('neutral-50'), 100: v('neutral-100'), 200: v('neutral-200'), 300: v('neutral-300'), 400: v('neutral-400'),
          500: v('neutral-500'), 600: v('neutral-600'), 700: v('neutral-700'), 750: v('neutral-750'), 800: v('neutral-800'),
          850: v('neutral-850'), 900: v('neutral-900'), 925: v('neutral-925'), 950: v('neutral-950'),
        },
        primary: {
          DEFAULT: v('primary'), 200: v('primary-200'), 300: v('primary-300'), 400: v('primary-400'), 500: v('primary-500'),
          600: v('primary-600'), 700: v('primary-700'), 800: v('primary-800'), 900: v('primary-900'), 950: v('primary-950'),
        },
        accent: v('accent'),
        signal: v('signal'),
        violet: v('violet'),
        cyan: v('cyan'),
        cobalt: v('cobalt'),
        acid: v('lime'),
        bubble: v('accent'),
        emerald: v('emerald'),
        rose: v('rose'),
        amber: { DEFAULT: v('amber'), 200: '#fde68a', 400: '#fbbf24' },
        ink: 'rgb(0 0 0 / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'ui-sans-serif', 'sans-serif'],
        pixel: ['var(--font-pixel)', 'ui-monospace', 'monospace'],
        term: ['var(--font-term)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        code: ['var(--font-code)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        xxs: ['.5rem', { lineHeight: '.625rem' }],
        '2xs': ['.625rem', { lineHeight: '.75rem' }],
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        pray: {
          '0%,100%': { transform: 'translate(0)' }, '20%': { transform: 'translate(-1px,1px)' },
          '40%': { transform: 'translate(1px,-1px)' }, '60%': { transform: 'translate(-1px)' }, '80%': { transform: 'translate(1px,1px)' },
        },
        shine: { '0%': { backgroundPosition: '200% center' }, '100%': { backgroundPosition: '-200% center' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-out': { '0%': { opacity: '1' }, '100%': { opacity: '0' } },
      },
      animation: {
        pray: 'pray .35s steps(2) infinite',
        'shine-reverse': 'shine 3s linear infinite reverse',
        'fade-in': 'fade-in .15s ease-out forwards',
        'fade-out': 'fade-out .15s ease-in forwards',
      },
    },
  },
  plugins: [
    animate,
    addIconSelectors({ prefixes: [{ prefix: 'ph', icons: phIcons }] }),
    plugin(({ addVariant }) => {
      addVariant('has-hover', '@media (hover: hover) and (pointer: fine)')
    }),
  ],
}
