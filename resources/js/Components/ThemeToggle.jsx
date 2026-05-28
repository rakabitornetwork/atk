import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'atk_theme';

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme !== 'light');
    document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) || 'dark';
        setTheme(stored);
        applyTheme(stored);
    }, []);

    function toggle() {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
    }

    return (
        <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--atk-border)] bg-[var(--atk-surface)] px-2 py-1.5 text-[11px] font-semibold text-[var(--atk-text)]"
        >
            {theme === 'light' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {theme === 'light' ? 'Terang' : 'Gelap'}
        </button>
    );
}
