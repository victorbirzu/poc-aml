import DashboardLayout from '@/components/dashboard/dashboard-layout';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex h-full items-center justify-center">
        <p>No data available. Please perform a search first.</p>
      </div>
    </DashboardLayout>
  );
}
