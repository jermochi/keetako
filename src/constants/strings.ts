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
  pipeline: {
    title: 'Pipeline',
    newThread: 'New thread',
    newThreadA11y: 'New thread',
    statuses: {
      requested: 'Requested',
      approved: 'Approved',
      shipped: 'Shipped',
      delivered: 'Delivered',
      content_due: 'Content due',
      posted: 'Posted',
      gmv_logged: 'GMV logged',
    },
    sectionCountA11y: (label: string, count: number) =>
      `${label}, ${count} ${count === 1 ? 'thread' : 'threads'}`,
    empty: {
      title: 'Nothing shipped yet — nothing to lose.',
      accent: 'Nothing shipped yet',
      body: 'Start a thread the moment you promise a sample. Every peso you spend gets tracked from here to the video — or to the ghost.',
      cta: 'Start your first thread',
    },
    loadError: {
      title: 'Couldn’t load your pipeline.',
      body: 'Check your connection and try again.',
      retry: 'Retry',
    },
  },
  threads: {
    form: {
      newTitle: 'New thread',
      creatorLabel: 'Creator',
      creatorPlaceholder: 'Pick a creator',
      creatorRequired: 'Pick a creator for this thread.',
      pickerSearchPlaceholder: 'Search handle',
      pickerAdd: (handle: string) => `Add @${handle}`,
      pickerAddOffline: 'You need a connection to add a new creator. Pick an existing one for now.',
      pickerAddError: 'Couldn’t add that creator. Check your connection and try again.',
      productLabel: 'Product',
      productPlaceholder: 'What you’re sending',
      productRequired: 'Product is required.',
      costLabel: 'Sample cost',
      costPlaceholder: '0',
      freeCap:
        'You’ve hit 10 active threads on the free plan. Close a finished thread to start a new one.',
      saveError: 'Couldn’t start the thread. Check your connection and try again.',
      save: 'Start thread',
    },
    detail: {
      cost: 'Sample cost',
      created: 'Started',
      missing: '—',
      notFoundTitle: 'Thread not found',
      notFoundBody: 'This thread may have been deleted.',
    },
  },
  creators: {
    title: 'Creators',
    searchPlaceholder: 'Search handle or niche',
    addA11y: 'Add creator',
    // Ghost count ("· 2 need a nudge") joins this line at M9, when creator_stats lands.
    countLine: (n: number) => `${n} ${n === 1 ? 'creator' : 'creators'}`,
    filterAll: 'All',
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
      newThread: 'New thread',
      // Platform and niche render as header chips, not info rows — no strings needed.
      followers: 'Followers',
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
      closeA11y: 'Close',
      avatarCaption: 'Avatar builds from the handle',
      handleLabel: 'Handle',
      handlePlaceholder: 'their.tiktok.handle',
      handleRequired: 'Handle is required.',
      duplicate:
        'You already track this handle on this platform — open their profile to edit it instead.',
      platformLabel: 'Platform',
      nicheLabel: 'Niche',
      nichePlaceholder: 'beauty, food finds…',
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
