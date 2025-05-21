import { useState, useEffect } from "react"
import { useWs } from '@/context/WebSocketContext';
import { ImageIcon } from "lucide-react";
import { InferenceSectionProps } from "@/components/device/types";

const InferenceSection: React.FC<InferenceSectionProps> = ({ activeMode, isInference, setIsInference }) => {
    const { lastBinaryData } = useWs();
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [lastInferenceText, setLastInferenceText] = useState<string>("Waiting for inference data..."); // For inference text
    
    
    useEffect(() => {
        let currentImageUrl = imageUrl; // Store current URL to properly revoke it later

        if (lastBinaryData instanceof Blob) { // Check if it's a Blob
            const newUrl = URL.createObjectURL(lastBinaryData);
            setImageUrl(newUrl);
            if (currentImageUrl) {
                URL.revokeObjectURL(currentImageUrl);
            }
        } else if (typeof lastBinaryData === 'string') {
            // If you also get text updates via the same WebSocket connection for inference results
            setLastInferenceText(lastBinaryData);
        }


        // Cleanup function: revoke the last URL when the component unmounts or before the next image is set.
        return () => {
            if (imageUrl) { // This will refer to the imageUrl state at the time of cleanup
                URL.revokeObjectURL(imageUrl);
                // console.log("Revoked Blob URL on cleanup:", imageUrl);
            }
        };
    // IMPORTANT: If imageUrl is in the dependency array, it might cause frequent revoking/creating.
    // The cleanup should revoke the *specific* URL created in *this* effect instance.
    // Let's refine the cleanup. The current `imageUrl` in the cleanup refers to the one from the previous render.
    // The `oldImageUrl` pattern was actually better for immediate revocation.
    // Re-instating a similar pattern but ensuring it's correct:
    // The current setup is mostly fine; the key is that `imageUrl` in the return function
    // captures the `imageUrl` from the scope of that `useEffect` run.
    }, [lastBinaryData]); // Only re-run when lastBinaryData changes


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
            <button className={`w-full py-4 px-2 text-base font-medium text-center rounded-lg border-2 transition-all duration-200 ease-in-out transform
                ${activeMode === "STAND_BY_MODE" ? "hover:scale-105 border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-600 cursor-pointer":
                    "border-gray-300 bg-gray-50 cursor-not-allowed"
                }    
            `}>
                Live Inference
            </button>
        </>
    )
}

export default InferenceSection


// 