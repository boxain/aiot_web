"use client"


import PageTitle from '@/components/PageTitle';
import SwitchPageButtom from '@/components/SwitchPageButtom';
import DevicesDashboard from '@/components/Device/DevicesDashboard';


export default function DevicePage() {
  return (
    <>
      {/* Title */}
      <PageTitle />
      <SwitchPageButtom />
      <DevicesDashboard />
    </>
  );
}