/**
 * Anti-FOUC bootstrap. Must run before first paint, so it ships as a blocking
 * inline script in <head> rather than a client component effect.
 *
 * Dark mode is ON by default; only an explicit stored 'false' turns it off.
 */
export default function DarkModeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var s=localStorage.getItem('dark_mode');if(s==='false'){return;}document.documentElement.classList.add('dark-mode');}catch(e){document.documentElement.classList.add('dark-mode');}})();`,
      }}
    />
  );
}