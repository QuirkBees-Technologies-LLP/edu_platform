import React from 'react';

export const getFormattedTime = (time) => {
  if (!time) return '';
  if (time < 60) return 'Less than 1 min';
  if (time < 120) return '1 min';
  if (time < 3600) return `${Math.floor(time / 60)} mins`;
  if (time < 7200) return '1 hour';
  if (time < 86400) return `${Math.floor(time / 3600)} hours`;
  if (time < 172800) return '1 day';
  return `${Math.floor(time / 86400)} days`;
};

// Custom reactions using emoji components
export const customReactions = [
  {
    type: 'heart',
    name: 'Heavy Red Heart',
    Component: () => <em-emoji id='heart' />,
  },
  {
    type: '+1',
    name: 'Thumbs Up Sign',
    Component: () => <em-emoji id='+1' />,
  },
  {
    type: '-1',
    name: 'Thumbs Down Sign',
    Component: () => <em-emoji id='-1' />,
  },
  {
    type: 'laughing',
    name: 'Smiling Face with Open Mouth and Tightly-Closed Eyes',
    Component: () => <em-emoji id='laughing' />,
  },
  {
    type: 'angry',
    name: 'Angry Face',
    Component: () => <em-emoji id='angry' />,
  },
];

const randomTitles = [
  'Admin',
  'Moderator',
  'Speaker',
  'Software Engineer',
  'Frontend Developer',
  'Mobile Developer',
  'System Architect',
  'Product Manager',
  'Content Designer',
  'Inside Sales',
  'UX/UI Designer',
  'Marketing Manger',
  'Technical Recruiter',
  'Technical Marketing',
  'Content Marketing',
  'Customer Success',
  'Integration Engineer',
  'Sales Engineer',
  'Community Manager',
  'Developer Relations',
  'Accounting',
  'Sales Operations',
];

export const getRandomTitle = () => {
  const index = Math.floor(Math.random() * randomTitles.length);
  return randomTitles[index];
};

const randomImages = [];

export const getRandomImage = () => {
  const index = Math.floor(Math.random() * randomImages.length);
  return randomImages[index];
};
