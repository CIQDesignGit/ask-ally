import { ChatCanvas } from "@/components/chat/ChatCanvas";
import { HistoryRail } from "@/components/chat/HistoryRail";
import { DashboardView } from "@/pages/DashboardView";
import { useAllyStore } from "@/store/ally-store";

export function ChatPage() {
  const dashboardFromThreadId = useAllyStore((s) => s.dashboardFromThreadId);

  return (
    <div className="flex h-full min-h-0">
      <HistoryRail />
      <ChatCanvas />
      {dashboardFromThreadId && (
        <DashboardView threadId={dashboardFromThreadId} />
      )}
    </div>
  );
}
