"use client"


import PageTitle from '@/components/PageTitle';
import SwitchPageButtom from '@/components/SwitchPageButtom';
import EdgesDashboard from '@/components/Edge/EdgesDashboard';


export default function EdgePage() {
  return (
    <>
      {/* Title */}
      <PageTitle />
      <SwitchPageButtom />
      <EdgesDashboard />
    </>
  );
}