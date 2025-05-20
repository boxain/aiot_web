import React, { useState, Dispatch, SetStateAction } from 'react';
import { X } from 'lucide-react';
import { AddFirmwareFormProps } from '@/components/firmware/types';
import uploadFirmwaresAPI from '@/api/firmware/uploadFirmwareAPI';


const AddFirmwareForm: React.FC<AddFirmwareFormProps> = ({ onClose, setFirmwares }) => {
  const [firmwareName, setFirmwareName] = useState('');
  const [description, setDescription] = useState('');
  const [firmwareFile, setFirmwareFile] = useState<File | null>(null); 
  const [isLoading, setIsLoading] = useState(false); 

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFirmwareFile(event.target.files[0]);
    } else {
      setFirmwareFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!firmwareName || !firmwareFile) {
      alert('Please provide firmware name and file.');
      return;
    }

    setIsLoading(true);
    try{
      const result = await uploadFirmwaresAPI(firmwareFile, firmwareName, description);
      if(result.success){

        // Clean all state
        setFirmwareName('');
        setDescription('');
        setFirmwareFile(null);
        // Close form
        onClose();
        // Update firmwares list
        setFirmwares((prev) => [...prev, result.data.firmwares[0]])

      }else{
        alert("Upload failed");
      }
    }finally{
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative"> {/* Modal content box */}
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 rounded-full p-1 transition cursor-pointer"
          aria-label="Close form"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Firmware</h2>

        <div className="space-y-4">
          {/* Firmware Name Input */}
          <div>
            <label htmlFor="firmwareName" className="block text-sm font-medium text-gray-700 mb-1">
              Firmware Name
            </label>
            <input
              type="text"
              id="firmwareName"
              value={firmwareName}
              onChange={(e) => setFirmwareName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Description Textarea */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          {/* File Upload Input */}
          <div>
            <label htmlFor="firmwareFile" className="block text-sm font-medium text-gray-700 mb-1">
              Select Firmware File (.bin, .hex, etc.)
            </label>
            <input
              type="file"
              id="firmwareFile"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-full file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100"
              required
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              }`}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload Firmware'}
            </button>
          </div>
        </div>
      </div>
  );
};

export default AddFirmwareForm;