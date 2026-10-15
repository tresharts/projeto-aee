import { useId } from 'react'
import type { Appointment } from '../../features/dashboard/dashboard.types'

interface AvatarBadgeProps {
  name: string
  tone?: Appointment['avatarTone']
  size?: 'sm' | 'md' | 'lg'
}

export function AvatarBadge({
  name,
  tone = 'blue',
  size = 'md',
}: AvatarBadgeProps) {
  const rawId = useId()
  const clipId = `avatar-${rawId.replace(/:/g, '')}`
  const profile = getAvatarProfile(name)

  return (
    <span
      className={`avatar-badge avatar-${tone} avatar-${size}`}
      title={name}
      aria-label={`Avatar de ${name}`}
    >
      <svg
        className="illustrated-avatar"
        viewBox="0 0 64 64"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx="32" cy="32" r="31" />
          </clipPath>
          <linearGradient id={`${clipId}-shirt`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={profile.shirt} />
            <stop offset="1" stopColor={profile.shirtShade} />
          </linearGradient>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <circle cx="32" cy="32" r="32" fill={profile.background} />
          <circle cx="17" cy="19" r="17" fill="rgba(255,255,255,.22)" />
          {profile.hairStyle === 'long' && (
            <path
              d="M15 31c0-15 7-23 17-23s17 8 17 23v27H15V31Z"
              fill={profile.hair}
            />
          )}
          {profile.hairStyle === 'curls' && (
            <g fill={profile.hair}>
              <circle cx="20" cy="20" r="8" />
              <circle cx="27" cy="14" r="8" />
              <circle cx="36" cy="14" r="8" />
              <circle cx="44" cy="20" r="8" />
              <circle cx="18" cy="29" r="7" />
              <circle cx="46" cy="29" r="7" />
            </g>
          )}
          {profile.hairStyle === 'bun' && (
            <>
              <circle cx="39" cy="9" r="8" fill={profile.hair} />
              <path
                d="M16 30c0-14 6-22 16-22s17 8 17 22v17H15l1-17Z"
                fill={profile.hair}
              />
            </>
          )}
          {profile.hairStyle === 'short' && (
            <path
              d="M16 28C15 15 23 8 33 8c11 0 18 8 16 22-5-6-11-9-18-9-6 0-11 2-15 7Z"
              fill={profile.hair}
            />
          )}
          <ellipse cx="17.5" cy="32" rx="3.4" ry="5" fill={profile.skinShade} />
          <ellipse cx="46.5" cy="32" rx="3.4" ry="5" fill={profile.skinShade} />
          <path
            d="M20 26c0-9 5-15 12-15s12 6 12 15v9c0 9-5 15-12 15s-12-6-12-15v-9Z"
            fill={profile.skin}
          />
          {profile.hairStyle === 'long' && (
            <path
              d="M18 28c2-13 8-18 15-18 8 0 13 6 14 18-5-1-9-4-12-9-4 5-9 8-17 9Z"
              fill={profile.hair}
            />
          )}
          {profile.hairStyle === 'bun' && (
            <path
              d="M19 27c2-12 7-17 14-17 8 0 13 6 14 18-7-2-12-6-15-11-3 5-7 8-13 10Z"
              fill={profile.hair}
            />
          )}
          {profile.hairStyle === 'curls' && (
            <path
              d="M19 25c1-10 6-15 13-15 8 0 13 6 14 16-5-3-9-7-11-12-4 6-9 9-16 11Z"
              fill={profile.hair}
            />
          )}
          <ellipse cx="27" cy="32" rx="1.35" ry="1.7" fill="#354d70" />
          <ellipse cx="37" cy="32" rx="1.35" ry="1.7" fill="#354d70" />
          <path
            d="M29 40c2 1.7 4 1.7 6 0"
            fill="none"
            stroke={profile.lips}
            strokeLinecap="round"
            strokeWidth="1.5"
          />
          <path
            d="M31 34.5c-.5 1.5-.3 2.4.8 2.6"
            fill="none"
            stroke={profile.skinShade}
            strokeLinecap="round"
            strokeWidth="1"
          />
          <path d="M27 47h10v9H27z" fill={profile.skinShade} />
          <path
            d="M10 67c1-12 9-19 22-19s21 7 22 19H10Z"
            fill={`url(#${clipId}-shirt)`}
          />
          {profile.glasses && (
            <g fill="none" stroke="#505c96" strokeWidth="1.4">
              <circle cx="26.5" cy="32" r="4" />
              <circle cx="37.5" cy="32" r="4" />
              <path d="M30.5 32h3" />
            </g>
          )}
        </g>
      </svg>
    </span>
  )
}

type HairStyle = 'short' | 'long' | 'curls' | 'bun'

interface AvatarProfile {
  background: string
  skin: string
  skinShade: string
  hair: string
  shirt: string
  shirtShade: string
  lips: string
  hairStyle: HairStyle
  glasses?: boolean
}

const profiles: Record<string, AvatarProfile> = {
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
}

const fallbackProfile: AvatarProfile = {
  background: '#bcd9ff',
  skin: '#ca8b65',
  skinShade: '#a96d50',
  hair: '#4d322a',
  shirt: '#6c71c9',
  shirtShade: '#4b4d9b',
  lips: '#894554',
  hairStyle: 'short',
}

function getAvatarProfile(name: string) {
  return profiles[name.toLocaleLowerCase('pt-BR')] ?? fallbackProfile
}
