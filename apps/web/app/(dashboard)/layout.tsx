import { DashboardLayoutWrapper } from "@/modules/dashboard/ui/layouts/dashboard-layout-wrapper";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
};

export default DashboardLayout;
