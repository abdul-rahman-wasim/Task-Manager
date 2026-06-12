// Inline script to set dark class before first paint — prevents FOUC
export function DarkModeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            const s = JSON.parse(localStorage.getItem('task-app-store') || '{}');
            if (s.state?.isDark) document.documentElement.classList.add('dark');
          } catch {}
        `,
      }}
    />
  )
}
