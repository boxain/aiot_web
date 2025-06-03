"use client"

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

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
        <>
            <button
                onClick={handleAddModelClick}
                className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 cursor-pointer"
            >
                + Add New Model
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {
                    models && models.length > 0 &&
                    (   
                        models.map((model) => (
                            <ModelCard key={model.id} model={model} setModels={setModels} showLabels={showLabels[model.id]} toggleLabels={toggleLabels}/>
                        ))
                    )
                }
            </div>

            {showAddModelForm && (
                <div className="fixed inset-0 bg-black/50 transition-opacity duration-300 flex items-center justify-center z-10">
                    <AddModelForm onClose={handleCloseAddModelForm} setModels={setModels} />
                </div>
            )}
        </>
    )
}

export default ModelsDashboard