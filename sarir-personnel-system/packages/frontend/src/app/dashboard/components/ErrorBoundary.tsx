"use client";
import React from "react";
type Props = { children: React.ReactNode; fallback?: React.ReactNode };
export default class ErrorBoundary extends React.Component<Props, {hasError:boolean, error?:any}> {
  constructor(props: Props){
    super(props); this.state = { hasError:false, error: undefined };
  }
  static getDerivedStateFromError(error: any){ return { hasError:true, error }; }
  componentDidCatch(error:any, info:any){
    if (process.env.NODE_ENV !== "production"){
      console.error("Dashboard ErrorBoundary:", error, info);
    }
  }
  handleReset = () => { this.setState({ hasError:false, error: undefined }); }
  render(){
    if (this.state.hasError){
      return this.props.fallback ?? (
        <div className="neon-card p-6 text-sm">
          <div className="text-red-300 mb-2">مشکلی در بارگذاری بخش داشبورد پیش آمد.</div>
          <button className="btn-brand" onClick={this.handleReset}>تلاش مجدد</button>
          <div className="opacity-60 mt-3 ltr max-w-full overflow-x-auto text-xs">
            {(this.state.error?.message ?? String(this.state.error || ""))}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
