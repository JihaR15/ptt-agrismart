import DashboardLayout from '../components/layout/DashboardLayout';

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout pageTitle="Dasbor Utama">
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-4xl font-bold text-on-surface">Dasbor Utama</h1>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;