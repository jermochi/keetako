/**
 * ALL user-facing copy lives here (English). No literal strings in screens.
 * Grouped by feature/screen; add sections as milestones land.
 */
export const strings = {
  app: {
    name: 'Keetako',
    tagline: 'Know which creators actually make you money.',
  },
  tabs: {
    pipeline: 'Pipeline',
    creators: 'Creators',
  },
  creators: {
    title: 'Creators',
    searchPlaceholder: 'Search handle or niche',
    addA11y: 'Add creator',
    followersUnit: 'followers',
    platforms: {
      tiktok_shop: 'TikTok Shop',
      shopee: 'Shopee',
      other: 'Other',
    },
    empty: {
      title: 'Your ledger starts empty — good.',
      accent: 'empty',
      body: 'Add the first creator you sent a sample to. The moment you log a cost, Keetako starts counting what comes back.',
      cta: 'Add your first creator',
    },
    noResults: {
      title: 'No matches',
      body: 'No creator handles or niches match your search.',
    },
    loadError: {
      title: 'Couldn’t load your creators.',
      body: 'Check your connection and try again.',
      retry: 'Retry',
    },
    detail: {
      edit: 'Edit',
      platform: 'Platform',
      followers: 'Followers',
      niche: 'Niche',
      contact: 'Contact',
      added: 'Added',
      notes: 'Notes',
      missing: '—',
      notFoundTitle: 'Creator not found',
      notFoundBody: 'This creator may have been deleted.',
      deleteCta: 'Delete creator',
      deleteConfirmTitle: 'Delete this creator?',
      deleteConfirmBody:
        'Their profile and full sample history will be deleted. This can’t be undone.',
      deleteCancel: 'Cancel',
      deleteConfirm: 'Delete',
    },
    form: {
      newTitle: 'New creator',
      editTitle: 'Edit creator',
      handleLabel: 'Handle',
      handlePlaceholder: 'their.tiktok.handle',
      handleRequired: 'Handle is required.',
      duplicate:
        'You already track this handle on this platform — open their profile to edit it instead.',
      platformLabel: 'Platform',
      nicheLabel: 'Niche',
      nichePlaceholder: 'beauty, food finds, home…',
      followersLabel: 'Followers',
      followersPlaceholder: '21400',
      contactLabel: 'Contact',
      contactPlaceholder: 'phone, email, or other handle',
      notesLabel: 'Notes',
      notesPlaceholder: 'How you found them, quirks, agreements…',
      save: 'Save creator',
    },
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
      networkError: 'Couldn’t reach the server. Check your connection and try again.',
      sendError: 'Couldn’t send the code right now. Please try again in a moment.',
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
