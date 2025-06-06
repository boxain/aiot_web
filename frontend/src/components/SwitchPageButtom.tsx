"use client"

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const SwitchPageButtom = () => {
    const pathname = usePathname();
    const router = useRouter();

    const categoryCSS = (path: string) => {
      if( pathname === path ){
        return "bg-[#005EA2] text-white"
      }else{
        return "bg-white text-gray-700"
      }
    }

    const updateCategory = (path: string) => {
      router.push(path)
    }


    return (
        <div className="flex space-x-4 mb-8">
            <button className={`px-6 py-2 ${categoryCSS("/device")} font-bold rounded-md shadow cursor-pointer`} onClick={() => {updateCategory("/device")}}>
                Device
            </button>
            <button className={`px-6 py-2 ${categoryCSS("/model")} font-bold rounded-md shadow cursor-pointer`} onClick={() => {updateCategory("/model")}}>
                Model
            </button>
            <button className={`px-6 py-2 ${categoryCSS("/firmware")} font-bold rounded-md shadow cursor-pointer`} onClick={() => {updateCategory("/firmware")}}>
                Firmware
            </button>
            {/* <button className={`px-6 py-2 ${categoryCSS("/edge")} font-bold rounded-md shadow cursor-pointer`} onClick={() => {updateCategory("/edge")}}>
                Edge Server
            </button> */}
        </div>
    )
}

export default SwitchPageButtom;