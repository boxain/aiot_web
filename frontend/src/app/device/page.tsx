"use client"


import PageTitle from '@/components/PageTitle';
import SwitchPageButtom from '@/components/SwitchPageButtom';
import DevicesDashboard from '@/components/device/DevicesDashboard';



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