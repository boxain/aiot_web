"use client"

import PageTitle from '@/components/PageTitle';
import SwitchPageButtom from '@/components/SwitchPageButtom';
import ModelsDashboard from '@/components/Model/ModelsDashboard';


export default function ModelPage() {
  return (
    <>
      {/* Title */}
      <PageTitle />
      <SwitchPageButtom />
      <ModelsDashboard />
    </>
  )
}