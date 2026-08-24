/**
 * Client-Side Security & Anti-DevTools Protection Module
 * Protects DOM tampering, blocks F12/Inspect shortcuts, disables context menu,
 * and attaches anti-debugger traps.
 */

export function initClientSecurity() {
  if (typeof window === 'undefined') return;

  // 1. Block Context Menu (Right Click Inspect)
  document.addEventListener('contextmenu', (e) => {
    const targetTag = e.target?.tagName?.toLowerCase();
    if (targetTag !== 'input' && targetTag !== 'textarea') {
      e.preventDefault();
    }
  }, { capture: true });

  // 2. Block DevTools Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    const key = e.key || '';
    const keyCode = e.keyCode || e.which;
    const ctrlOrMeta = e.ctrlKey || e.metaKey;

    // F12
    if (key === 'F12' || keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I / Cmd+Option+I (Inspect Elements)
    // Ctrl+Shift+J / Cmd+Option+J (Open Console)
    // Ctrl+Shift+C / Cmd+Option+C (Inspect Element Picker)
    if (ctrlOrMeta && e.shiftKey && (key === 'I' || key === 'i' || key === 'J' || key === 'j' || key === 'C' || key === 'c' || keyCode === 73 || keyCode === 74 || keyCode === 67)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U / Cmd+Option+U (View Page Source)
    if (ctrlOrMeta && (key === 'U' || key === 'u' || keyCode === 85)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S / Cmd+S (Save Page)
    if (ctrlOrMeta && (key === 'S' || key === 's' || keyCode === 83)) {
      const targetTag = e.target?.tagName?.toLowerCase();
      if (targetTag !== 'input' && targetTag !== 'textarea') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
  }, { capture: true });

  // 3. Anti-Debugger / DevTools Breakpoint Trap
  const startDebuggerTrap = () => {
    const antiDebug = () => {
      const startTime = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const endTime = performance.now();
      if (endTime - startTime > 100) {
        console.clear();
      }
    };

    setInterval(antiDebug, 1500);
  };

  // 4. Custom Console Warning Banner
  const printConsoleWarning = () => {
    const styleTitle = 'color: #ff0055; font-size: 28px; font-weight: 900; -webkit-text-stroke: 1px black;';
    const styleBody = 'color: #00f2fe; font-size: 14px; font-weight: bold;';
    const styleSub = 'color: #cbd5e1; font-size: 12px;';

    console.log('%c⚠️ DỪNG LẠI! / STOP!', styleTitle);
    console.log(
      '%cĐây là tính năng bảo mật của trình duyệt dành cho nhà phát triển.',
      styleBody
    );
    console.log(
      '%cMọi hành vi can thiệp HTML/DOM qua F12 chỉ thay đổi trên máy cá nhân của bạn và sẽ bị Server từ chối.',
      styleSub
    );
  };

  try {
    printConsoleWarning();
    startDebuggerTrap();
  } catch (err) {
    // Fail silently in restricted sandbox
  }
}
