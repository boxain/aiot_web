"use client"

import PageTitle from '@/components/PageTitle';
import SwitchPageButtom from '@/components/SwitchPageButtom';
import ModelsDashboard from '@/components/model/ModelsDashboard';


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