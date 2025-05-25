import { useState, useEffect } from "react"
import { useWs } from '@/context/WebSocketContext';
import { ImageIcon } from "lucide-react";
import { InferenceSectionProps } from "@/components/device/types";
import inferenceAPI from "@/api/device/inferenceAPI";

const InferenceSection: React.FC<InferenceSectionProps> = ({ device_id, activeMode, isInference, setIsInference }) => {
    const { deviceImages, setDeviceImages } = useWs();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [lastInferenceText, setLastInferenceText] = useState<string>("Waiting for inference data..."); // For inference text
    
    useEffect(() => {
        if(!deviceImages[device_id] || deviceImages[device_id].length == 0){
            return
        }

        let currentImageUrl = imageUrl; 
        const imageData = deviceImages[device_id][0];

        if (imageData instanceof Blob) { // Check if it's a Blob
            const newUrl = URL.createObjectURL(imageData);
            setImageUrl(newUrl);
            if (currentImageUrl) {
                URL.revokeObjectURL(currentImageUrl);
            }
        }

        setDeviceImages((prev)=> {
            const existedDeviceImages = prev[device_id].slice(1);
            return {
                ...prev,
                [device_id]: existedDeviceImages
            }
        })

        return () => {
            if (imageUrl) { 
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [deviceImages]);


    const handleLiveInference = async () => {
        if(isInference) return;
        setIsInference(true);
        try{
            const result = await inferenceAPI(device_id);
            if(!result.success){
                alert("Inference Failed"); 
                console.error("Reset failed:", result.message);
            }
        } finally {
            setIsInference(false);
        }
    };


    return (
        <> 
            <div className="w-full aspect-video flex items-center justify-center bg-gray-200 rounded-lg text-gray-500 overflow-hidden">
                {imageUrl ? (
                    <img src={imageUrl} alt="Live Inference Feed" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center">
                    <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                    </div>
                )}
            </div>
            <p className="text-sm text-gray-600 font-medium text-center py-2 bg-gray-50 rounded-md">{lastInferenceText}</p>
            <button 
                className={`w-full py-4 px-2 text-base font-medium text-center rounded-lg border-2 transition-all duration-200 ease-in-out transform
                ${activeMode === "STAND_BY_MODE" ? "hover:scale-105 border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-600 cursor-pointer":
                    "border-gray-300 bg-gray-50 cursor-not-allowed"}`}
                onClick={handleLiveInference}
            >
                Live Inference
            </button>
        </>
    )
}

export default InferenceSection