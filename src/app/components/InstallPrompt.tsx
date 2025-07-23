"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as unknown as { MSStream: unknown }).MSStream
    );

    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as Navigator & { standalone?: boolean })
          .standalone === true
    );

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if app is already installed
    const handleAppInstalled = () => {
      setCanInstall(false);
      setInstallPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }

      setInstallPrompt(null);
      setCanInstall(false);
    } catch (error) {
      console.error("Error showing install prompt:", error);
    }
  };

  if (isStandalone) {
    return (
      <div className="space-y-4 p-4 border border-green-200 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800">
          ✅ App Installed
        </h3>
        <p className="text-green-700">
          Great! You&apos;re using the installed version of Expense Tracker.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold">📱 Install App</h3>

      {isIOS ? (
        <div className="space-y-2">
          <p className="text-gray-600">Install this app on your iOS device:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>
              Tap the share button <span className="inline-block">📤</span> in
              Safari
            </li>
            <li>Scroll down and select &ldquo;Add to Home Screen&rdquo;</li>
            <li>Tap &ldquo;Add&rdquo; to install the app</li>
          </ol>
          <p className="text-xs text-gray-500 mt-2">
            The app will appear on your home screen like a native app.
          </p>
        </div>
      ) : canInstall ? (
        <div className="space-y-2">
          <p className="text-gray-600">
            Install this app for a better, faster experience with offline
            access.
          </p>
          <button
            onClick={handleInstallClick}
            className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 flex items-center gap-2"
          >
            <span>📲</span>
            Install App
          </button>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Works offline</p>
            <p>• Faster loading</p>
            <p>• Push notifications</p>
            <p>• Home screen shortcut</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-gray-600">
            This app can be installed for a better experience.
          </p>
          <p className="text-sm text-gray-500">
            Look for the install icon <span className="inline-block">⊕</span> in
            your browser&apos;s address bar, or check your browser&apos;s menu
            for &ldquo;Install app&rdquo; or &ldquo;Add to Home Screen&rdquo;
            options.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <strong>Chrome:</strong> Look for the install icon in the address
              bar
            </p>
            <p>
              <strong>Edge:</strong> Click the ⋯ menu → Apps → Install this site
              as an app
            </p>
            <p>
              <strong>Firefox:</strong> Limited PWA support
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
