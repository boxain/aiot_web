import { useState, useEffect, useRef, useContext, createContext, ReactNode, Dispatch, SetStateAction } from "react";
import { useAuth } from "./AuthContext";


interface WebSocketContextType {
    isConnected: boolean;
    status: string;
    stateQueue: ConnectionStateType[];
    setStateQueue: Dispatch<SetStateAction<ConnectionStateType[]>>; 
    deviceImages: Record<string, Blob[]>;
    setDeviceImages: Dispatch<SetStateAction<Record<string, Blob[]>>>;
    deviceLogs: Record<string, DeviceLogType[]>;
    setDeviceLogs: Dispatch<SetStateAction<Record<string, DeviceLogType[]>>>;
}

interface ConnectionStateType {
    action: string;
    device_id: string;
    mode?: "CONTINUOUS_MODE" | "STAND_BY_MODE";
    model_name?: string;
    firmware_name?: string;
}

export interface DeviceLogType {
    level: "info" | "warning" | "error";
    message: string;
}

const WebSocketContext = createContext<WebSocketContextType>({
    isConnected: false,
    status:"disconnected",
    stateQueue: [],
    setStateQueue: () => {},
    deviceImages: {},
    setDeviceImages: () => {},
    deviceLogs: {},
    setDeviceLogs: () => {}
})


const base64ToBlob = async (base64Str: string, type: string = "image/jpeg") => {
    const res = await fetch(`data:${type};base64,${base64Str}`);
    return res.blob();
}

export const WebSocketProvider: React.FC<{children: ReactNode}> = ({children}) => {
    
    const MAX_BUFFER_SIZE = 100;
    const MAX_LOG_SIZE = 100;
    const ws = useRef<WebSocket | null>(null);
    const isMounted = useRef(true);
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("disconnected");
    const [stateQueue, setStateQueue] = useState<ConnectionStateType[]>([]);
    const [deviceImages, setDeviceImages] = useState<Record<string, Blob[]>>({});
    const [deviceLogs, setDeviceLogs] = useState<Record<string, DeviceLogType[]>>({});
    

    useEffect(() => {

        if(user){
            console.log("Websocket connecting...");
            isMounted.current = true;
            setStatus("connecting");


            const requestURI = `${process.env.NEXT_PUBLIC_BACKEND_WEBSOCKET_HOSTNAME}/api/user/ws/${user.id}`;
            const websocket = new WebSocket(requestURI);
            ws.current = websocket;

    
            websocket.onopen = () => {
                if(isMounted.current){
                    setIsConnected(true);
                    setStatus("connected");
                    console.log('WebSocket connected');
                }
            }
    
            websocket.onmessage = async (event) => {
                if (isMounted.current){
                    if(typeof event.data === "string") {
                        try{
                            const data = JSON.parse(event.data)
                            if(data.action === "CONNECTED"){

                                console.log("connected device: ", data.device_id);
                                setStateQueue(prev => [...prev, data]);

                            }else if(data.action === "DISCONNECTED"){

                                console.log("disconnected device: ", data.device_id);
                                setStateQueue(prev => [...prev, data])

                            }else if(data.action === "OTA"){

                                const { device_id, status, firmware_name } = data;
                                console.log(`OTA: ${firmware_name} status: ${status} for device: ${device_id}`);
                                if(status === "RECEIVED"){
                                    setStateQueue(prev => [...prev, { action: "BUSY", device_id}]);
                                }else if(status === "COMPLETED"){
                                    setStateQueue(prev => [...prev, { action: "CONNECTED", device_id, firmware_name}]);
                                }else if(status === "ERROR"){
                                    setStateQueue(prev => [...prev, { action: "CONNECTED", device_id}]);
                                }

                            }else if(data.action === "MODE_SWITCH"){

                                const { device_id, status, mode } = data;
                                console.log(`MODE_SWITCH status: ${status} for device: ${device_id}`);
                                if(status === "RECEIVED"){
                                    setStateQueue(prev => [...prev, { action: "BUSY", device_id}]);
                                }else if(status === "COMPLETED"){
                                    setStateQueue(prev => [...prev, { action: "CONNECTED", device_id, mode}]);
                                }else if(status === "ERROR"){
                                    setStateQueue(prev => [...prev, { action: "CONNECTED", device_id}]);
                                }

                            }else if(data.action === "MODEL_DOWNLOAD"){

                                const { device_id, status, model_id } = data;
                                console.log(`MODEL_DOWNLOAD status: ${status} for device: ${device_id}`);
                                if(status === "RECEIVED"){
                                    setStateQueue(prev => [...prev, { action: "BUSY", device_id}]);
                                }else if(status === "COMPLETED"){
                                    setStateQueue(prev => [...prev, { action: "CONNECTED", device_id, model_id}]);
                                }else if(status === "ERROR"){
                                    setStateQueue(prev => [...prev, { action: "CONNECTED", device_id}]);
                                }

                            }else if(data.action === "MODEL_SWITCH"){

                                const { device_id, status, model_name } = data;
                                console.log(`MODEL_SWITCH: ${model_name} status: ${status} for device: ${device_id}`);
                                if(status === "RECEIVED"){
                                    setStateQueue(prev => [...prev, { action: "BUSY", device_id}]);
                                }else if(status === "COMPLETED"){
                                    setStateQueue(prev => [...prev, { action: "CONNECTED", device_id, model_name}]);
                                }else if(status === "ERROR"){
                                    setStateQueue(prev => [...prev, { action: "CONNECTED", device_id}]);
                                }

                            }else if(data.action === "INFERENCE_RESULT"){
                                
                                const { device_id, image_data } = data;
                                console.log("INFERENECE_RESULT: ", device_id);
                                
                                try{
                                    const imageBlob = await base64ToBlob(image_data);
                                    setDeviceImages((prev) => {
                                        const existingImages = prev[device_id] || [];
                                        const updatedImages = [...existingImages, imageBlob]
                                        if (updatedImages.length > MAX_BUFFER_SIZE){
                                            updatedImages.shift();
                                        }
                                        return {
                                            ...prev,
                                            [device_id]: updatedImages
                                        }
                                    });

                                }catch(e){
                                    console.error("Error converting Base64 to Blob:", e);
                                }
                            
                            }else if(data.action === "LOG"){

                                const { device_id, level, message } = data;
                                setDeviceLogs((prev) => {
                                    const existingLogs = prev[device_id] || [];
                                    const updatedLogs = [...existingLogs, { level, message}];
                                    if(updatedLogs.length > MAX_LOG_SIZE){
                                        updatedLogs.shift();
                                    }
                                    return {
                                        ...prev,
                                        [device_id]: updatedLogs
                                    };
                                })

                            }else{
                                console.log("Not valid task");
                            }


                        }catch(error){
                            console.error("Failed to parse JSON: ", error);
                        }

                    }
                }
            }
    
            websocket.onerror = (event) => {
                if (isMounted.current) {
                    setIsConnected(false);
                    setStatus('error');
                    console.error('WebSocket Error:', event);
                  }
            }
    
            websocket.onclose = () => {
                if (isMounted.current) {
                    setIsConnected(false);
                    setStatus("disconnected");
                    console.log('WebSocket Disconnected:');
                }
            }

        }else{
            console.log("Does not login...");
        }

        return () => {
            if(ws.current && ws.current.readyState === WebSocket.OPEN){
                ws.current.close();
                console.log("websocket disconnted and be cleaned");
            }
        }

    }, [user])


    return (
        <WebSocketContext.Provider value={{isConnected, status, stateQueue, setStateQueue, deviceImages, setDeviceImages, deviceLogs, setDeviceLogs}}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWs = () => {
    return useContext(WebSocketContext);
}