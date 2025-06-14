'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import connectionDeviceAPI from '@/api/device/connectionAPI'; 
import { processApiError } from '@/lib/error'; 

// Define the props for the component
interface AddDeviceFormProps {
    onClose: () => void; 
}

const AddDeviceForm: React.FC<AddDeviceFormProps> = ({ onClose }) => {
    const [ssid, setSsid] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async () => {
        if(!ssid || !password){
            return;
        }
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await connectionDeviceAPI(ssid, password);
            onClose(); 

        }catch(error){
            const processedError = processApiError(error);
            const displayMessage = `[${processedError.code}] ${processedError.message}`;
            toast.error(displayMessage);

            if (processedError.details) {
                console.error("API Error Details:", processedError.details);
            } else {
                console.error("Caught Error:", error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelClick = () => {
        setSsid('');
        setPassword('');
        onClose();
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative z-50 border border-gray-200">

            {/* Close Button (Optional, but good for modals) */}
            <button
                onClick={handleCancelClick}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
                disabled={isSubmitting}
                aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Pair New Device</h2>

            {/* Reminder Message */}
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
                <p className="font-bold">Important:</p>
                <p>Before pairing, please connect your computer/phone to the device's WiFi network. The network name will look like <code className="font-mono bg-blue-200 px-1 rounded">PROV_XXXX</code>.</p>
            </div>

            {/* Error Message Display */}
            {/* {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                    <p>{error}</p>
                </div>
            )} */}


            <div>
                <div className="mb-4">
                    <label htmlFor="ssid" className="block text-gray-700 text-sm font-semibold mb-2"> {/* Added font-semibold */}
                        WiFi SSID:
                    </label>
                    <input
                        type="text"
                        id="ssid"
                        value={ssid}
                        onChange={(e) => setSsid(e.target.value)}
                        className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-blue-500 focus:border-blue-500" // Refined classes
                        required
                        disabled={isSubmitting}
                        placeholder="Enter home WiFi SSID" // Added placeholder
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2"> {/* Added font-semibold */}
                        WiFi Password:
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="shadow-sm appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-blue-500 focus:border-blue-500" // Refined classes
                        required
                        disabled={isSubmitting}
                        placeholder="Enter home WiFi password" // Added placeholder
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        type="submit"
                        className={`w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                        disabled={isSubmitting}
                        onClick={handleFormSubmit}
                    >
                        {isSubmitting ? 'Connecting...' : 'Connect Device'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddDeviceForm;