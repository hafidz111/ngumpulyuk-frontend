export const eventQueryKeys = {
  all: ['events'],
  detail: (id) => ['events', 'detail', String(id)],
};

export const userQueryKeys = {
  participationSummary: ['users', 'me', 'participation-summary'],
};
