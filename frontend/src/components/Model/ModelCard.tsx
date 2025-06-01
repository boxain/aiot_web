import { useState } from 'react';
import { ModelProps } from '@/components/model/types';
import { Trash2 } from 'lucide-react';
import deleteModelAPI from '@/api/model/deleteModelAPI';

const ModelCard = ({ model, setModels } : ModelProps) => {
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
    <div className="bg-white rounded-lg shadow-md p-4 w-full flex flex-col space-y-3">
      {/* Model Name & Optional Delete Icon: Similar to Firmware card's header */}
      <div className="flex justify-between items-center">
        <h3 className="text-gray-800 font-semibold text-lg truncate pr-2" title={model.name}>
          {model.name}
        </h3>
        <button
          onClick={() => {handleDeleteClick(model.id)}}
          className="text-gray-400 hover:text-red-500 transition-colors duration-150 p-1 flex-shrink-0 cursor-pointer"
          aria-label={`Delete model ${model.name}`}
        >
          <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
        </button>
      </div>

      {/* Model Details: Styled like the information lines in your examples */}
      <div className="space-y-1 text-sm text-gray-600">
        <p>
          <span className="font-medium text-gray-700">Type:</span> {model.model_type}
        </p>   
        <p>
          <span className="font-medium text-gray-700">Created time:</span> {model.created_time}
        </p>        
        <p className="text-gray-700 mt-2 text-xs"> 
          {model.description}
        </p>
      </div>
    </div>
  );
};

export default ModelCard;