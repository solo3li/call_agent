import DashboardLayout from '@/components/DashboardLayout';

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout userType="developer">{children}</DashboardLayout>;
}
