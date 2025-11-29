"use client";

import React, { type ErrorInfo } from "react";

type Props = { children: React.ReactNode; fallback?: React.ReactNode };
type State = { hasError: boolean; error?: unknown };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Dashboard ErrorBoundary:", error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const errorMessage =
        typeof (this.state.error as { message?: unknown })?.message === "string"
          ? (this.state.error as { message: string }).message
          : String(this.state.error || "");
      return (
        this.props.fallback ?? (
          <div className="neon-card p-6 text-sm">
            <div className="text-red-300 mb-2">خطا در نمایش این بخش رخ داد.</div>
            <button className="btn-brand" onClick={this.handleReset}>
              تلاش مجدد
            </button>
            <div className="opacity-60 mt-3 ltr max-w-full overflow-x-auto text-xs">{errorMessage}</div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
