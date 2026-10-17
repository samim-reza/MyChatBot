export const githubConfig = {
  username: 'samim-reza',
  apiUrl: 'https://github-contributions-api.jogruber.de/v4',
  title: 'GitHub activity',
  blockSize: 11,
  blockMargin: 3,
  fontSize: 12,
  maxLevel: 4,
  months: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  weekdays: ['', 'M', '', 'W', '', 'F', ''],
  totalCountLabel: '{{count}} contributions in the last year',
  // Amber steps that match the site's signal color in each mode.
  theme: {
    dark: ['#1f2228', '#4a3510', '#7a5410', '#c4840f', '#f5a524'],
    light: ['#e2e5ea', '#f5d9a8', '#eeb560', '#d98a14', '#a85f00'],
  },
  errorState: {
    title: 'Unable to load GitHub contributions',
    description: 'Check out my profile directly for the latest activity',
    buttonText: 'View on GitHub',
  },
  loadingState: {
    title: 'Loading contributions...',
    description: 'Fetching GitHub activity data',
  },
};
