export function SidebarBloom() {
  return (
    <svg
      className="sidebar-bloom"
      viewBox="0 0 300 240"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sidebar-sky" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#c9c8ff" />
          <stop offset="1" stopColor="#aee8ff" />
        </linearGradient>
        <linearGradient id="sidebar-violet" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#7048f5" />
          <stop offset="1" stopColor="#b89cff" />
        </linearGradient>
        <linearGradient id="sidebar-blue" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#3e8dff" />
          <stop offset="1" stopColor="#79c6ff" />
        </linearGradient>
        <linearGradient id="sidebar-coral" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ff9b79" />
          <stop offset="1" stopColor="#ff70b7" />
        </linearGradient>
        <linearGradient id="sidebar-mint" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#48d7c9" />
          <stop offset="1" stopColor="#85e9bd" />
        </linearGradient>
        <linearGradient id="sidebar-sun" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffd14c" />
          <stop offset="1" stopColor="#ffa66e" />
        </linearGradient>
      </defs>
      <path
        d="M5 115C25 35 96 4 150 47c38-31 104-20 139 33v160H5V115Z"
        fill="url(#sidebar-sky)"
        opacity=".55"
      />
      <ellipse cx="55" cy="154" rx="47" ry="90" fill="#c2afff" opacity=".72" transform="rotate(-28 55 154)" />
      <ellipse cx="77" cy="181" rx="43" ry="81" fill="url(#sidebar-violet)" opacity=".88" transform="rotate(-43 77 181)" />
      <ellipse cx="151" cy="126" rx="39" ry="76" fill="url(#sidebar-blue)" opacity=".76" transform="rotate(25 151 126)" />
      <ellipse cx="127" cy="207" rx="67" ry="36" fill="#4fb8ff" opacity=".84" transform="rotate(-9 127 207)" />
      <ellipse cx="184" cy="204" rx="67" ry="34" fill="url(#sidebar-mint)" opacity=".83" transform="rotate(18 184 204)" />
      <ellipse cx="221" cy="185" rx="42" ry="55" fill="url(#sidebar-sun)" opacity=".84" transform="rotate(-20 221 185)" />
      <ellipse cx="251" cy="152" rx="25" ry="48" fill="url(#sidebar-coral)" opacity=".91" transform="rotate(23 251 152)" />
      <ellipse cx="267" cy="210" rx="43" ry="31" fill="#c87ee4" opacity=".76" transform="rotate(-16 267 210)" />
      <path d="M128 131c9 3 13 10 13 21-10-1-17-7-20-17l7-4Z" fill="#ffc79a" opacity=".95" />
      <path d="M141 126c8-7 14-8 19-1-1 9-7 15-18 18l-1-17Z" fill="#ff8ea6" opacity=".9" />
    </svg>
  )
}

export function MotivationBloom() {
  return (
    <svg
      className="motivation-bloom"
      viewBox="0 0 180 130"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="motivation-blue" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#6d8eff" />
          <stop offset="1" stopColor="#b9c9ff" />
        </linearGradient>
        <linearGradient id="motivation-lilac" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#b09bff" />
          <stop offset="1" stopColor="#ebcaff" />
        </linearGradient>
        <linearGradient id="motivation-pink" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ff83b5" />
          <stop offset="1" stopColor="#ffc5d8" />
        </linearGradient>
      </defs>
      <ellipse cx="119" cy="93" rx="38" ry="69" fill="url(#motivation-lilac)" opacity=".85" transform="rotate(-28 119 93)" />
      <ellipse cx="146" cy="59" rx="21" ry="48" fill="url(#motivation-blue)" opacity=".9" transform="rotate(18 146 59)" />
      <ellipse cx="91" cy="105" rx="34" ry="54" fill="#e8d7ff" opacity=".95" transform="rotate(37 91 105)" />
      <ellipse cx="157" cy="109" rx="38" ry="50" fill="url(#motivation-pink)" opacity=".96" transform="rotate(33 157 109)" />
      <ellipse cx="111" cy="119" rx="50" ry="31" fill="#f3dcff" opacity=".92" />
      <path d="M142 67c-12 18-17 36-16 57" fill="none" stroke="#8a74e8" strokeLinecap="round" strokeWidth="2" opacity=".45" />
      <path d="M103 76c9 16 13 31 11 47" fill="none" stroke="#aa8eea" strokeLinecap="round" strokeWidth="2" opacity=".35" />
    </svg>
  )
}
