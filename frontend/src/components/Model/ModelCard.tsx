import { useState } from 'react';
import { ModelProps } from '@/components/model/types';
import { Trash2, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import deleteModelAPI from '@/api/model/deleteModelAPI';

const ModelCard = ({ model, setModels, showLabels, toggleLabels} : ModelProps) => {
  const [onDelete, setOnDelete] = useState(false);

  const handleDeleteClick = async (id: string) => {
    if(onDelete)return;
    try{
      setOnDelete(true);
      const result = await deleteModelAPI(id);
      if(result.success){
        alert("Delete firmware success !");
        setModels((prev) => prev.filter((fm => fm.id !== id)))
      }else{
        alert("Delete firmware failed....");
      }
    }finally{
      setOnDelete(false)
    }
  }

  return (
    // ModelCard 容器設置 relative，以便內部絕對定位的元素定位
    // Ensure min-height if cards are very short to prevent overlay from being too large relative to card.
    <div className="bg-white rounded-lg shadow-md p-4 w-full flex flex-col space-y-3 relative overflow-hidden">
      {/* Model Name & Optional Delete Icon */}
      <div className="flex justify-between items-center">
        <h3 className="text-gray-800 font-semibold text-lg truncate pr-2" title={model.name}>
          {model.name}
        </h3>
        <button
          onClick={() => { handleDeleteClick(model.id); }}
          className="text-gray-400 hover:text-red-500 transition-colors duration-150 p-1 flex-shrink-0 cursor-pointer"
          aria-label={`Delete model ${model.name}`}
          disabled={onDelete}
        >
          <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
        </button>
      </div>

      {/* Model Details */}
      <div className="space-y-1 text-sm text-gray-600">
        <p>
          <span className="font-medium text-gray-700">Type:</span> {model.model_type}
        </p>
        <p>
          <span className="font-medium text-gray-700">Created time:</span> {model.created_time}
        </p>
        {model.description && (
          <p className="text-gray-700 mt-2 text-xs line-clamp-2">
            {model.description}
          </p>
        )}
      </div>

      {/* --- Labels Toggle Button (always visible if labels exist) --- */}
      {Object.keys(model.labels).length > 0 && (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <button
            onClick={() => toggleLabels(model.id)}
            className="flex items-center justify-center w-full text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none py-1.5 px-3 rounded-md border border-blue-500 hover:bg-blue-50 transition-colors"
            aria-expanded={showLabels}
            aria-controls={`labels-content-${model.id}`}
          >
            {showLabels ? (
              <>
                <ChevronUp size={16} className="mr-1" /> Hide Labels
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" /> Show Labels ({Object.keys(model.labels).length})
              </>
            )}
          </button>
        </div>
      )}

      <div
        id={`labels-content-${model.id}`}
        className={`
          absolute inset-x-0 bottom-0 h-[85%]
          bg-white rounded-b-lg shadow-lg z-20 
          transition-all duration-300 ease-in-out transform
          ${showLabels ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
          p-4 flex flex-col // Flex for internal layout
          border-t border-gray-200 // Add a border to separate from main card content
        `}
      >
        <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-3">
          <h4 className="flex items-center text-base font-semibold text-gray-800">
            <Tag size={18} className="mr-2 text-blue-600" />
            Model Labels
          </h4>
          <button
            onClick={() => toggleLabels(model.id)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded-full"
            aria-label="Close labels"
          >
            <ChevronUp size={18} /> {/* Slightly larger icon for close */}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs max-h-40 overflow-y-auto pr-1">
          {Object.entries(model.labels).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center bg-blue-50 text-blue-800 rounded-full px-3 py-1.5 shadow-sm min-w-0"
            >
              <span className="font-semibold flex-shrink-0 mr-1">{key}:</span>
              <span className="truncate">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModelCard;