import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";

const History: React.FC = () => {
    return (
        <DashboardLayout pageTitle="Riwayat Data Historis">
            <div className="flex items-center justify-center h-screen">
                <h1 className="text-4xl font-bold text-on-surface">Riwayat Log</h1>
            </div>
        </DashboardLayout>
    );
};

export default History;
