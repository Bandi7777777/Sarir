"use client";

import { useCallback, useRef } from "react";

import LoginLayout from "./ui/LoginLayout";
import { LoginFormCard } from "./ui/LoginFormCard";
import { LoginFormPanel } from "./ui/LoginFormPanel";
import { LoginHero } from "./ui/LoginHero";

export default function LoginPage() {
  const usernameRef = useRef<HTMLInputElement>(null!);

  const handleFocusUsername = useCallback(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, []);

  return (
    <LoginLayout
      hero={<LoginHero onStartClick={handleFocusUsername} />}
      form={
        <LoginFormPanel>
          <LoginFormCard usernameRef={usernameRef} />
        </LoginFormPanel>
      }
    />
  );
}
