"use client"

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, BrainCircuit } from 'lucide-react';
import AddModelForm from '@/components/model/AddModelForm';
import ModelCard from '@/components/model/ModelCard';
import Loading from '@/components/Loading';
import { Model } from '@/components/model/types';
import getModelsAPI from '@/api/model/getModelsAPI';

const ModelsDashboard = () => {
    const [models, setModels] = useState<Model[]>([]);
    const [showLabels, setShowLabels] = useState<Record<string,boolean>>({});
    const [isGetModels, setIsGetModels ] = useState(true);
    const [showAddModelForm, setShowAddModelForm] = useState(false);
    
    useEffect(() => {

        const getModels = async () => {
            try{
                const result = await getModelsAPI();
                if(result.success){

                    const formattedModels = result.data.models.map((model: Model) => {
                        return {
                            ...model,
                            created_time: format(new Date(model.created_time), 'yyyy/MM/dd HH:mm')
                        }
                    })
                    setModels(formattedModels)

                    const initialShowLabels: Record<string, boolean> = {};
                    formattedModels.forEach((model: Model) => {
                        initialShowLabels[model.id] = false;
                    });
                    setShowLabels(initialShowLabels);

                }else{
                    alert("Get models failed")
                }
            }finally{
                setIsGetModels(false);
            }
        }

        getModels();

    }, [])
    
    const handleAddModelClick = () => {
        setShowAddModelForm(true);
    };

    const handleCloseAddModelForm = () => {
        setShowAddModelForm(false);
    };

    const toggleLabels = (model_id: string) => {
        setShowLabels(prev => ({
            ...prev,
            [model_id]: !prev[model_id]
        }));
    };
    

    if(isGetModels){
        return <Loading />
    }
    

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
            <div className='max-w-7xl mx-auto'>
                {/* Title */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">AI Model Management</h1>
                        <p className="mt-1 text-sm text-gray-600">Browse, add, and manage your machine learning models.</p>
                    </div>
                    <button
                        onClick={handleAddModelClick}
                        className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Model
                    </button>
                </div>
                
                {/* Model List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {                 
                        models.map((model) => (
                            <ModelCard key={model.id} model={model} setModels={setModels} showLabels={showLabels[model.id]} toggleLabels={toggleLabels}/>
                        ))
                    }
                </div>

                
                {!isGetModels && models.length === 0 && (
                     <div className="mt-8 text-center col-span-full py-16 px-6 bg-white rounded-lg shadow-sm">
                        <BrainCircuit className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-xl font-medium text-gray-800">No AI Models Found</h3>
                        <p className="text-gray-500 mt-2">Get started by adding your first model.</p>
                    </div>
                )}

                {showAddModelForm && (
                    <div className="fixed inset-0 bg-black/50 transition-opacity duration-300 flex items-center justify-center z-10">
                        <AddModelForm onClose={handleCloseAddModelForm} setModels={setModels} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default ModelsDashboard

