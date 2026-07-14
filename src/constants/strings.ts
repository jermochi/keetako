/**
 * ALL user-facing copy lives here (English). No literal strings in screens.
 * Grouped by feature/screen; add sections as milestones land.
 */
export const strings = {
  app: {
    name: 'Keetako',
    tagline: 'Know which creators actually make you money.',
  },
  home: {
    placeholder: 'Setup in progress.',
    signOut: 'Sign out',
  },
  auth: {
    signIn: {
      title: 'Sign in to Keetako',
      subtitle: 'Enter your email and we’ll send you a 6-digit code.',
      emailLabel: 'Email',
      emailPlaceholder: 'you@example.com',
      submit: 'Send code',
      sending: 'Sending…',
      invalidEmail: 'Enter a valid email address.',
      genericError: 'Couldn’t send the code. Check your connection and try again.',
    },
    verify: {
      title: 'Enter your code',
      subtitle: 'We sent a 6-digit code to',
      codeLabel: 'Code',
      codePlaceholder: '123456',
      submit: 'Verify',
      verifying: 'Verifying…',
      resend: 'Resend code',
      invalidCode: 'Enter the 6-digit code from your email.',
      genericError: 'That code didn’t work. Try again or resend.',
    },
  },
} as const;
