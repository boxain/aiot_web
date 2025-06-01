import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, PlusCircle, Trash2 } from 'lucide-react'; // Added PlusCircle and Trash2
import { AddModelFormProps, ModelTypeOption } from '@/components/model/types';
import uploadModelAPI from '@/api/model/uploadModelAPI'; // Assuming this API will be adapted or replaced for models with labels

const AddModelForm: React.FC<AddModelFormProps> = ({ onClose, setModels }) => {
  const modelTypeOptions: ModelTypeOption[] = ['Classification', 'Object Detection'];
  const [modelName, setModelName] = useState('');
  const [description, setDescription] = useState('');
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelType, setModelType] = useState<'Classification' | 'Object Detection'>("Object Detection");
  const [labels, setLabels] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);  



  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setModelFile(event.target.files[0]);
    } else {
      setModelFile(null);
    }
  };


  const handleAddLabel = () => {
    // Add a new label object with a unique ID (timestamp used here for simplicity)
    setLabels([...labels, { id: Date.now().toString(), name: '' }]);
  };


  const handleLabelNameChange = (id: string, newName: string) => {
    setLabels(
      labels.map((label) => (label.id === id ? { ...label, name: newName } : label))
    );
  };


  const handleRemoveLabel = (id: string) => {
    setLabels(labels.filter((label) => label.id !== id));
  };


  const handleSubmit = async () => {
    if (!modelName || !modelFile || !labels) {
      alert('Please provide model name and file.'); // Changed from "firmware name"
      return;
    }

    // Optional: Validate that all label names are filled if labels exist
    if (labels.some(label => label.name.trim() === '')) {
      alert('Please fill in all label names or remove empty labels.');
      return;
    }

    setIsLoading(true);
    try {
      // Format labels for submission. Example: { "0": "cat", "1": "dog" }
      const formattedLabels = labels.reduce((acc, label, index) => {
        acc[index.toString()] = label.name.trim(); // Ensure names are trimmed
        return acc;
      }, {} as Record<string, string>);

      const labels_str = JSON.stringify(labels);
      const result = await uploadModelAPI(modelFile, modelName, description, modelType, labels_str);
      
      if (result.success) {
        // Clean all state
        setModelName('');
        setDescription('');
        setModelFile(null);
        setLabels([]); // Clear labels state
        
        // Close form
        onClose();
        
        // Update models list (assuming firmwares[0] is the convention for the new item)
        // You might need to adjust how the new model (with labels) is added to the list.
        // For example, if result.data contains the full model including labels:
        // const newModelData = { ...result.data.firmwares[0], labels: formattedLabels };
        // setModels((prev) => [...prev, newModelData]);
        
        const model = result.data.models[0];
        setModels((prev) => [...prev, {...model, created_time: format(new Date(model.created_time), 'yyyy/MM/dd HH:mm')} ]); 

      } else {
        alert("Upload failed: " + (result.message || "An unknown error occurred."));
      }
    } catch (error) {
        console.error("Upload error:", error);
        alert("An error occurred during upload. Please check the console for details.");
    }
    finally {
      setIsLoading(false);
    }
  };


  const handleClose = () => {
    onClose();
  };


  return (
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 rounded-full p-1 transition cursor-pointer"
          aria-label="Close form"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New AI Model</h2> {/* Increased mb for title */}
        <div className="space-y-5"> {/* Increased spacing for form sections */}

          {/* --- Model Name Input --- */}
          <div>
            <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 mb-1">
              Model Name
            </label>
            <input
              type="text"
              id="modelName" // Changed from firmwareName
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* --- Model Type Select --- */}
          <div>
            <label htmlFor="modelType" className="block text-sm font-medium text-gray-700 mb-1">
              Model Type
            </label>
            <select
              id="modelType"
              value={modelType}
              onChange={(e) => setModelType(e.target.value as ModelTypeOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
              required
            >
              <option value="" disabled>Select model type...</option>
              {modelTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* --- Description Textarea --- */}
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

          {/* --- Model Labels Section --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model Labels (e.g., 0: cat, 1: dog)
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2"> {/* Added max-height and scroll */}
              {labels.length === 0 && (
                <p className="text-xs text-gray-500 italic">No labels added yet.</p>
              )}
              {labels.map((label, index) => (
                <div key={label.id} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 w-16 flex-shrink-0">Label {index}:</span>
                  <input
                    type="text"
                    value={label.name}
                    onChange={(e) => handleLabelNameChange(label.id, e.target.value)}
                    placeholder={`Name for label ${index}`}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <button
                    onClick={() => handleRemoveLabel(label.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    aria-label={`Remove label ${index}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddLabel}
              type="button"
              className="mt-3 flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium py-1.5 px-3 border border-blue-500 rounded-md hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <PlusCircle size={17} className="mr-1.5" />
              Add Label
            </button>
          </div>


          {/* --- File Upload Input --- */}
          <div>
            {modelFile &&
              <label htmlFor="modelFile" className="block text-sm font-medium text-gray-700 mb-2">
                Selected model File (.espdl)
              </label>
            }
            <input
              type="file"
              id="modelFile" // Changed from firmwareFile
              onChange={handleFileChange}
              accept=".espdl" // Good to specify accepted file type
              className="w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100 cursor-pointer"
              required
            />
          </div>

          {/* --- Submit Button --- */}
          <div>
            <button
              type="submit" // Default type is submit, explicit here
              className={`w-full py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              }`}
              onClick={handleSubmit}
              disabled={isLoading || !modelFile || !modelName } // Disable if loading or required fields missing
            >
              {isLoading ? 'Uploading...' : 'Upload model'}
            </button>
          </div>

        </div>
      </div>
  );
};

export default AddModelForm;