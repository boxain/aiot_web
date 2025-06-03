"use client";

import React, { useState, useEffect } from 'react';
import { X, Check, ListRestart, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

import { Model } from '@/components/model/types';
import { ModelSelectionProps } from '@/components/device/types';
import getModelsAPI from '@/api/model/getModelsAPI';
import modelDeploymentAPI from '@/api/device/modelDeploymentAPI';


const ModelListItem = ({ model, isSelected, onSelect }: { model: Model; isSelected: boolean; onSelect: (id: string) => void; }) => {  
    const [showAllLabels, setShowAllLabels] = useState(false);
    const MAX_LABELS_TO_SHOW = 5;
    const displayedLabels = showAllLabels ? Object.entries(model.labels) : Object.entries(model.labels).slice(0, MAX_LABELS_TO_SHOW);
    const hasMoreLabels = Object.keys(model.labels).length > MAX_LABELS_TO_SHOW;

    // Base model type to determine css style
    const getModelTypeColor = () => {
        switch (model.model_type) {
            case 'Classification':
                return 'bg-blue-100 text-blue-800';
            case 'Object Detection': 
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div
            className={`p-4 border mb-3 rounded-lg cursor-pointer transition-all duration-150 ease-in-out
                        hover:shadow-md hover:border-blue-400
                        ${isSelected ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300' : 'bg-white border-gray-300'}`}
            onClick={() => onSelect(model.id)}
        >
        
            {/* -- Model detail -- */}
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="flex items-center gap-x-2 text-md font-semibold text-gray-800">
                        {model.name}
                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getModelTypeColor()}`}>
                            {model.model_type}
                        </div>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                </div>
            </div>

            {/* -- Labels -- */}
            {Object.keys(model.labels).length > 0 && (
            <div className="mb-2">
                <div className="flex flex-wrap gap-2">
                {displayedLabels.map((label, index) => (
                    <span
                        key={index}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200"
                    >
                        {index}: {label}
                    </span>
                ))}
                {hasMoreLabels && (
                    <button
                    className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium focus:outline-none"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowAllLabels(!showAllLabels);
                    }}
                    >
                    {showAllLabels ? (
                        <>
                        <span>Show less</span>
                        <ChevronUp className="w-3 h-3 ml-1" />
                        </>
                    ) : (
                        <>
                        <span>Show more</span>
                        <ChevronDown className="w-3 h-3 ml-1" />
                        </>
                    )}
                    </button>
                )}
                </div>
            </div>
            )}

            <div className="text-xs text-gray-500 mt-2">
                Created: {new Date(model.created_time).toLocaleDateString()}
            </div>
        </div>
    );
};


const ModelSelection: React.FC<ModelSelectionProps> = ({ selectedDevices, showSelectModel, setShowSelectModel, cancleSelectDeviceMode }) => {
    const [models, setModels] = useState<Model[]>([]);
    const [isGetModels, setIsGetModels ] = useState(true);
    const [isDeploymentUpdate, setIsDeploymentUpdate] = useState(false);
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

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
                }else{
                    alert("Get model failed")
                }
            }finally{
                setIsGetModels(false);
            }
        }

        getModels();

    }, [])

    const handleCancelClick = () => {
        setSelectedModelId(null); 
        setShowSelectModel(false);
        cancleSelectDeviceMode();
    };

    const handleConfirmClick = async () => {
        if(isDeploymentUpdate) return;
        if(!selectedModelId) return;

        try{
            setIsDeploymentUpdate(true);
            const result = await modelDeploymentAPI(selectedDevices, selectedModelId);
            if(result.success){
                alert(result.message);
                handleCancelClick();
            }else{
                alert(result.message);
            }
        }finally{
            setIsDeploymentUpdate(false);
        }
    };

    return (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50">
            <div className={`fixed bottom-0 left-0 right-0 z-20 h-[400px] transition-transform duration-500 ease-in-out ${showSelectModel ? "translate-y-0" : "translate-y-full"}`}>
                <div className="bg-white h-full shadow-2xl rounded-t-xl flex flex-col overflow-hidden">
                    {/* Header with Title and Buttons */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-200">
                        <h2 id="firmware-selection-title" className="text-lg font-semibold text-gray-700">
                            Select AI Model for deployment
                        </h2>
                        <div className="flex gap-x-2">
                            <button
                                onClick={handleConfirmClick}
                                disabled={!selectedModelId}
                                className={`flex items-center justify-center px-3 py-2 text-white text-xs sm:text-sm rounded-md ${ selectedModelId ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'} transition-colors duration-150`}
                            >
                                <Check className="w-4 h-4 sm:mr-1" />
                                <span className="hidden sm:inline">Confirm</span>
                            </button>
                            <button
                                onClick={handleCancelClick}
                                className="flex items-center justify-center px-3 py-2 bg-gray-200 text-gray-700 text-xs sm:text-sm rounded-md hover:bg-gray-300 transition-colors duration-150"
                                aria-label="Cancel OTA update and close selection"
                            >
                                <X className="w-4 h-4 sm:mr-1" />
                                <span className="hidden sm:inline">Cancel</span>
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Firmware List */}
                    <div className="overflow-y-auto flex-grow p-4 space-y-2 bg-gray-50">

                    {models && models.length > 0 ? 
                        (
                            models.map((md) => (
                            <ModelListItem
                                key={md.id}
                                model={md}
                                isSelected={selectedModelId === md.id}
                                onSelect={setSelectedModelId}
                            />
                            ))
                        ) 
                    : 
                        (
                            <div className="text-center text-gray-500 py-10 flex flex-col items-center">
                            <ListRestart className="w-10 h-10 mb-2 text-gray-400" />
                            <p>No firmware versions available.</p>
                            <p className="text-sm">Please upload firmware to proceed.</p>
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
};

export default ModelSelection;