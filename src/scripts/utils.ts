/**
 * Escapes HTML special characters in a string to prevent XSS.
 * @param str The string to escape
 * @returns The escaped string
 */
export function escapeHtml(str: string): string {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
