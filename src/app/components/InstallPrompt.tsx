"use client";

import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as unknown as { MSStream: unknown }).MSStream
    );

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold">Install App</h3>

      {isIOS ? (
        <div className="space-y-2">
          <p className="text-gray-600">Install this app on your device:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Tap the share button in Safari</li>
            <li>Select &ldquo;Add to Home Screen&rdquo;</li>
            <li>Tap &ldquo;Add&rdquo; to install the app</li>
          </ol>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-gray-600">
            Install this app for a better experience. Look for the install
            prompt in your browser&apos;s address bar.
          </p>
        </div>
      )}
    </div>
  );
}
