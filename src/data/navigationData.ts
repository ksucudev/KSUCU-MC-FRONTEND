export interface NavItem {
  label: string;
  href?: string;
  external?: boolean;
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const organizationSections: NavSection[] = [
  {
    title: 'Quick Access',
    items: [
      { label: 'Talk to us', href: '/recomendations' },
      { label: 'Financials', href: '/financial' },
      { label: 'Requisitions', href: '/requisitions' },
      { label: 'Bible Study', href: '/Bs' },
      { label: 'File Manager', href: '/my-docs' },
      { label: 'Library', href: '/library' },
      { label: 'Win a Soul', href: '/save' },
    ],
  },
  {
    title: 'Boards',
    items: [
      { label: 'ICT Board', href: '/boards/ict' },
      { label: 'Media Board', href: '/boards/media' },
      { label: 'Communication Board', href: '/boards/communication' },
      { label: 'Editorial Board', href: '/boards/editorial' },
    ],
  },
  {
    title: 'Evangelistic Teams',
    items: [
      { label: 'RIVET', href: '/ets/rivet' },
      { label: 'ESET', href: '/ets/eset' },
      { label: 'WESO', href: '/ets/weso' },
      { label: 'NET', href: '/ets/net' },
      { label: 'CET', href: '/ets/cet' },
    ],
  },
  {
    title: 'Ministries',
    items: [
      { label: 'Praise & Worship', href: '/ministries/praiseAndWorship' },
      { label: 'Choir', href: '/ministries/choir' },
      { label: 'Instrumentalists (Wananzambe)', href: '/ministries/wananzambe' },
      { label: 'High School', href: '/ministries/highSchool' },
      { label: 'Church School', href: '/ministries/churchSchool' },
      { label: 'Creativity', href: '/ministries/creativity' },
      { label: 'Intercessory', href: '/ministries/intercessory' },
      { label: 'Ushering & Hospitality', href: '/ministries/ushering' },
      { label: 'Compassion & Counseling', href: '/ministries/compassion' },
    ],
  },
  {
    title: 'Fellowships',
    items: [
      {
        label: 'Class Fellowships',
        children: [
          { label: 'First Years', href: '/classFellowship' },
          { label: 'Second Years', href: '/classFellowship' },
          { label: 'Third Years', href: '/classFellowship' },
          { label: 'Fourth Years', href: '/classFellowship' },
        ],
      },
      { label: 'Brothers Fellowship', href: '/brothersfellowship' },
      { label: 'Sisters Fellowship', href: '/sistersfellowship' },
    ],
  },
  {
    title: 'Committees',
    items: [
      { label: 'Sub Executive Committee', href: '/other-committees' },
      { label: 'Sub Committee', href: '/other-committees' },
      { label: 'Software Dev & Maintenance', href: '/other-committees' },
      { label: 'Bible Study Committee', href: '/other-committees#bible-study' },
      { label: 'Best-P Committee', href: '/other-committees#best-p' },
      { label: 'Christian Minds Committee', href: '/christianminds' },
      { label: 'Discipleship Committee', href: '/other-committees#discipleship' },
      { label: 'Prayer Committee', href: '/other-committees#prayer' },
      { label: 'Orientation Committee', href: '/other-committees#orientation' },
      { label: 'Strategic Plan Implementation', href: '/other-committees#strategic-plan' },
      { label: 'Elders Committee', href: '/elders' },
      { label: 'Development Committee', href: '/other-committees#development' },
      { label: 'Accounts Committee', href: '/other-committees#accounts' },
      { label: 'Worship Committee', href: '/other-committees#worship' },
      { label: 'Missions Committee', href: '/other-committees#missions' },
    ],
  },
  {
    title: 'Classes',
    items: [
      { label: 'Best-P Classes', href: '/bestpClass' },
      { label: 'Discipleship Class', href: '/discipleship' },
    ],
  },
  {
    title: 'Leadership',
    items: [
      { label: 'Executive Committee', href: '/leadership' },
      { label: 'Sub-Committee', href: '/other-committees' },
      {
        label: 'Other Committees',
        children: [
          { label: 'Sub Executive Committee', href: '/other-committees' },
          { label: 'Software Dev & Maintenance', href: '/other-committees' },
          { label: 'Bible Study Committee', href: '/other-committees#bible-study' },
          { label: 'Best-P Committee', href: '/other-committees#best-p' },
          { label: 'Christian Minds Committee', href: '/christianminds' },
          { label: 'Discipleship Committee', href: '/other-committees#discipleship' },
          { label: 'Prayer Committee', href: '/other-committees#prayer' },
          { label: 'Orientation Committee', href: '/other-committees#orientation' },
          { label: 'Strategic Plan Implementation', href: '/other-committees#strategic-plan' },
          { label: 'Elders Committee', href: '/elders' },
          { label: 'Development Committee', href: '/other-committees#development' },
          { label: 'Accounts Committee', href: '/other-committees#accounts' },
          { label: 'Worship Committee', href: '/other-committees#worship' },
          { label: 'Missions Committee', href: '/other-committees#missions' },
        ],
      },
    ],
  },
];

// Grouped navigation for the Header mega-menu
export const headerNavGroups = {
  services: organizationSections[0], // Quick Access
  mediaDesk: [
    { label: 'News', href: '/news' },
    { label: 'Gallery', href: '/media' },
    {
      label: 'Socials',
      children: [
        { label: 'TikTok', href: 'https://tiktok.com/@ksucu_mc', external: true },
        { label: 'YouTube', href: 'https://www.youtube.com/@ksucu-mc', external: true },
        { label: 'Facebook', href: 'https://www.facebook.com/ksucumaincampus', external: true },
        { label: 'Instagram', href: 'https://www.instagram.com/ksucu_mc', external: true },
        { label: 'X (Twitter)', href: 'https://twitter.com/ksucumc', external: true },
      ],
    },
  ] as NavItem[],
  organization: [
    organizationSections[1], // Boards
    organizationSections[2], // Evangelistic Teams
    organizationSections[3], // Ministries
    organizationSections[4], // Fellowships
  ],
  governance: [
    organizationSections[7], // Leadership (now first, includes Other Committees)
    {
      title: 'Governing Docs',
      items: [
        { label: 'Constitution', href: '/pdfs/constitution.pdf', external: true },
        { label: 'Financial Policy', href: '#' },
        { label: 'Leadership Manual', href: '#' },
        { label: 'Partnership Policies', href: '#' },
      ],
    },
  ],
  joinUs: [
    {
      title: 'Ministries',
      items: [
        { label: 'Praise & Worship', href: '/ministries/praiseAndWorship' },
        { label: 'Choir', href: '/ministries/choir' },
        { label: 'Instrumentalists', href: '/ministries/wananzambe' },
        { label: 'Intercessory', href: '/ministries/intercessory' },
        { label: 'Ushering & Hospitality', href: '/ministries/ushering' },
        { label: 'Creativity', href: '/ministries/creativity' },
        { label: 'Church School', href: '/ministries/churchSchool' },
        { label: 'High School', href: '/ministries/highSchool' },
        { label: 'Compassion & Counseling', href: '/ministries/compassion' },
      ],
    },
    {
      title: 'Boards',
      items: [
        { label: 'ICT Board', href: '/boards/ict' },
        { label: 'Media Board', href: '/boards/media' },
        { label: 'Communication Board', href: '/boards/communication' },
        { label: 'Editorial Board', href: '/boards/editorial' },
      ],
    },
    {
      title: 'Evangelistic Teams',
      items: [
        { label: 'RIVET', href: '/ets/rivet' },
        { label: 'ESET', href: '/ets/eset' },
        { label: 'WESO', href: '/ets/weso' },
        { label: 'NET', href: '/ets/net' },
        { label: 'CET', href: '/ets/cet' },
      ],
    },
    {
      title: 'Fellowships',
      items: [
        { label: 'Brothers Fellowship', href: '/brothersfellowship' },
        { label: 'Sisters Fellowship', href: '/sistersfellowship' },
        {
          label: 'Class Fellowships',
          children: [
            { label: 'First Years', href: '/classFellowship' },
            { label: 'Second Years', href: '/classFellowship' },
            { label: 'Third Years', href: '/classFellowship' },
            { label: 'Fourth Years', href: '/classFellowship' },
          ],
        },
      ],
    },
    {
      title: 'Bible Study',
      items: [
        { label: 'Register for Bible Study', href: '/Bs' },
        { label: 'View Bible Study Groups', href: '/Bs' },
      ],
    },
    {
      title: 'Classes',
      items: [
        { label: 'Best-P Classes', href: '/bestpClass' },
        { label: 'Discipleship Class', href: '/discipleship' },
      ],
    },
    {
      title: 'Committees',
      items: [
        { label: 'Prayer Committee', href: '/other-committees#prayer' },
        { label: 'Discipleship Committee', href: '/other-committees#discipleship' },
        { label: 'Christian Minds Committee', href: '/christianminds' },
        { label: 'Bible Study Committee', href: '/other-committees#bible-study' },
        { label: 'Worship Committee', href: '/other-committees#worship' },
        { label: 'Missions Committee', href: '/other-committees#missions' },
        { label: 'Orientation Committee', href: '/other-committees#orientation' },
        { label: 'Elders Committee', href: '/elders' },
        { label: 'View All Committees', href: '/other-committees' },
      ],
    },
  ],
};
