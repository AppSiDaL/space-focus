import StarsBG from "@/components/StarsBG";
import React from "react";
import NotificationPermission from "@/components/NotificationPermission";
import TimerView from "@/components/TimerView/TimerView";
import LogoutButton from "@/components/LogoutButton";
//import TestNotification from "@/components/TestNotification";

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <StarsBG />
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 ios-safe-top flex-shrink-0">
        <div className="flex justify-between items-center p-2">
          {/*<TestNotification />*/}
          <h1 className="text-xl font-bold gradient-text">Space Focus</h1>
          <LogoutButton />
        </div>
      </header>
      <main className="relative z-10">
        <NotificationPermission />
        <div>
          <div className="container mx-auto px-2 pb-2 ios-safe-bottom">
            <div
              className="space-y-3"
              id="focus-panel"
              role="tabpanel"
              aria-labelledby="focus-tab"
            >
              <TimerView />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
