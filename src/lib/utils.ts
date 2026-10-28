
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Handles contact actions (Email/Phone) intelligently based on device type.
 * - Mobile: Opens the default app (Mail/Phone).
 * - Desktop: Copies the value to clipboard and executes onCopy callback.
 * - Includes a fallback for environments where navigator.clipboard is restricted.
 */
export function handleContactAction(type: 'email' | 'phone', value: string, onCopy?: () => void) {
    const isMobile = typeof window !== 'undefined' && window.matchMedia("(max-width: 768px)").matches;

    if (isMobile) {
        window.location.href = type === 'email' ? `mailto:${value}` : `tel:${value}`;
    } else {
        // Try Modern Clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(value)
                .then(() => {
                    if (onCopy) onCopy();
                })
                .catch(err => {
                    console.warn('Clipboard API failed, attempting fallback...', err);
                    fallbackCopyTextToClipboard(value, onCopy);
                });
        } else {
            // Fallback for non-secure contexts or older browsers
            fallbackCopyTextToClipboard(value, onCopy);
        }
    }
}

/**
 * Fallback method to copy text using a temporary textarea.
 * This ensures functionality in iframes or HTTP contexts.
 */
function fallbackCopyTextToClipboard(text: string, onSuccess?: () => void) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Ensure the textarea is not visible but part of the DOM
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful && onSuccess) {
            onSuccess();
        } else if (!successful) {
            console.error('Fallback copy command was unsuccessful');
        }
    } catch (err) {
        console.error('Fallback copy failed', err);
    }

    document.body.removeChild(textArea);
}
