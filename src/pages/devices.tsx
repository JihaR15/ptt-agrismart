import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";

const Devices: React.FC = () => {
    return (
        <DashboardLayout pageTitle="Manajemen Perangkat">
            <div className="flex items-center justify-center h-screen">
                <h1 className="text-4xl font-bold text-on-surface">Manajemen Perangkat</h1>
            </div>
        </DashboardLayout>
    );
};

export default Devices;
