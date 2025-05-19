import React, { useState } from 'react';
import { X } from 'lucide-react';


interface AddFirmwareFormProps {
  onClose: () => void;
}

// AddFirmwareForm component
const AddFirmwareForm: React.FC<AddFirmwareFormProps> = ({ onClose }) => {
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Simple validation
    if (!firmwareName || !firmwareFile) {
      alert('Please provide firmware name and file.');
      return;
    }

    // Optional: If you have an onSubmit prop to handle the actual upload
    // setIsLoading(true);
    // const formData = new FormData();
    // formData.append('name', firmwareName);
    // formData.append('description', description);
    // formData.append('file', firmwareFile);

    // try {
    //   await onSubmit(formData); // Call the parent's submit handler
    //   // Clear form and close modal on success
    //   setFirmwareName('');
    //   setDescription('');
    //   setFirmwareFile(null);
    //   onClose();
    // } catch (error) {
    //   console.error('Firmware upload failed:', error);
    //   alert('Failed to upload firmware.');
    // } finally {
    //   setIsLoading(false);
    // }

    // --- For demonstration purposes ---
    console.log('Submitting Firmware:');
    console.log('Name:', firmwareName);
    console.log('Description:', description);
    console.log('File:', firmwareFile);
    // Simulate successful submission and close
    alert('Firmware data logged to console (replace with actual upload logic)');
    // Clear form and close modal
    setFirmwareName('');
    setDescription('');
    setFirmwareFile(null);
    // Call onClose prop received from parent
    // onClose(); // Uncomment this when you integrate it
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload Firmware'}
            </button>
          </div>
        </form>
      </div>

  );
};

export default AddFirmwareForm;