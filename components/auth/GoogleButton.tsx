"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

const GoogleButton = () => {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderGoogleButton = () => {
      if (!window.google || !buttonRef.current) {
        return false;
      }

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID,
        callback: async (response: any) => {
          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              credential: response.credential,
            }),
          });

          const data = await res.json();

          console.log("Status:", res.status);
          console.log("Response:", data);
        },
      });

      buttonRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: 400,
      });

      return true;
    };

    if (renderGoogleButton()) {
      return;
    }

    const interval = setInterval(() => {
      if (renderGoogleButton()) {
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <div ref={buttonRef} />;
};

export default GoogleButton;
