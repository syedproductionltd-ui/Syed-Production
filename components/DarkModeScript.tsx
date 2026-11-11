/**
 * Anti-FOUC bootstrap. Must run before first paint, so it ships as a blocking
 * inline script in <head> rather than a client component effect.
 *
 * Light mode is ON by default; only an explicit stored 'true' turns dark mode on.
 */
export default function DarkModeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var s=localStorage.getItem('dark_mode');if(s==='true'){document.documentElement.classList.add('dark-mode');}}catch(e){}})();`,
      }}
    />
  );
}