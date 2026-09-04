"use client";

import { ApiResponse } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

declare global {
  interface Window {
    google?: any;
  }
}

const GoogleButton = () => {
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderGoogleButton = () => {
      if (!window.google || !buttonRef.current) {
        return false;
      }

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID,
        callback: async (googleResponse: any) => {
          try {
            const res = await fetch("/api/auth/google", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                credential: googleResponse.credential,
              }),
            });

            const result: ApiResponse = await res.json();

            if (result.success) {
              toast.success(result.message);
               router.push("/");
            } else {
              toast.error(result.message);
            }
          } catch (error) {
            console.error(error);
            toast.error("حدث خطأ ما، يرجى المحاولة مرة أخرى");
          }
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
