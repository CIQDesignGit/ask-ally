import { ChatCanvas } from "@/components/chat/ChatCanvas";
import { DashboardView } from "@/pages/DashboardView";
import { useAllyStore } from "@/store/ally-store";

export function ChatPage() {
  const dashboardFromThreadId = useAllyStore((s) => s.dashboardFromThreadId);

  return (
    <div className="flex h-full min-h-0">
      <ChatCanvas />
      {dashboardFromThreadId && (
        <DashboardView threadId={dashboardFromThreadId} />
      )}
    </div>
  );
}
