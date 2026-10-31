export type HairStyle = 'short' | 'long' | 'curls' | 'bun';

export interface AvatarProfile {
  background: string;
  skin: string;
  skinShade: string;
  hair: string;
  shirt: string;
  shirtShade: string;
  lips: string;
  hairStyle: HairStyle;
  glasses?: boolean;
}

export const AVATAR_PROFILES: Record<string, AvatarProfile> = {
  'professora lara silva': {
    background: '#ead991',
    skin: '#b9684f',
    skinShade: '#9f503e',
    hair: '#4a2c29',
    shirt: '#f48e79',
    shirtShade: '#bf5e74',
    lips: '#883b4d',
    hairStyle: 'long',
  },
  'gabriel pires de souza': {
    background: '#a8d9ff',
    skin: '#7c482f',
    skinShade: '#613521',
    hair: '#2b211f',
    shirt: '#22b69b',
    shirtShade: '#188777',
    lips: '#5e2b2c',
    hairStyle: 'curls',
  },
  'arthur soares costa': {
    background: '#ffe7a4',
    skin: '#f0bf8e',
    skinShade: '#d99c6c',
    hair: '#7c4b29',
    shirt: '#1aa890',
    shirtShade: '#157765',
    lips: '#a75f58',
    hairStyle: 'short',
  },
  'lara pinho': {
    background: '#f8c99e',
    skin: '#efb07b',
    skinShade: '#d88f61',
    hair: '#5c3020',
    shirt: '#ffc53d',
    shirtShade: '#ef8c32',
    lips: '#a85050',
    hairStyle: 'long',
  },
  'vinicius pereira': {
    background: '#f3a9d2',
    skin: '#a85d45',
    skinShade: '#894535',
    hair: '#3d2927',
    shirt: '#ffe05c',
    shirtShade: '#f0a835',
    lips: '#75323f',
    hairStyle: 'curls',
  },
  'willian lucas souza': {
    background: '#f9e19a',
    skin: '#efc091',
    skinShade: '#d89d70',
    hair: '#44302a',
    shirt: '#c76d42',
    shirtShade: '#914837',
    lips: '#a65a58',
    hairStyle: 'short',
  },
  'richelle iuize': {
    background: '#aee6c7',
    skin: '#d99d72',
    skinShade: '#bd7956',
    hair: '#6b4128',
    shirt: '#8665d6',
    shirtShade: '#6546ad',
    lips: '#954c59',
    hairStyle: 'long',
  },
  'prof. carla soares': {
    background: '#f8bd8d',
    skin: '#d58a5f',
    skinShade: '#b96a49',
    hair: '#543128',
    shirt: '#f2b72f',
    shirtShade: '#df7c35',
    lips: '#923c4b',
    hairStyle: 'long',
  },
  'prof. rodrigo santoro': {
    background: '#f8e5a5',
    skin: '#e7b582',
    skinShade: '#ca8e61',
    hair: '#51352c',
    shirt: '#537ab9',
    shirtShade: '#3d568f',
    lips: '#8f504d',
    hairStyle: 'short',
    glasses: true,
  },
};

export const FALLBACK_AVATAR_PROFILE: AvatarProfile = {
  background: '#bcd9ff',
  skin: '#ca8b65',
  skinShade: '#a96d50',
  hair: '#4d322a',
  shirt: '#6c71c9',
  shirtShade: '#4b4d9b',
  lips: '#894554',
  hairStyle: 'short',
};
