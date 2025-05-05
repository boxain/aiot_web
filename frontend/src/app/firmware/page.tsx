"use client"


import PageTitle from '@/components/PageTitle';
import SwitchPageButtom from '@/components/SwitchPageButtom';
import FirmwaresDashboard from '@/components/Firmware/FirmwaresDashboard';


export default function FirmwarePage() {
  return (
    <>
      {/* Title */}
      <PageTitle />
      <SwitchPageButtom />
      <FirmwaresDashboard />
    </>
  );
}