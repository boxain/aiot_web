import { useState, useEffect, useRef, useContext, createContext, ReactNode, Dispatch, SetStateAction } from "react";
import { useAuth } from "./AuthContext";


interface WebSocketContextType {
    isConnected: boolean;
    status: string;
    stateQueue: ConnectionStateType[];
    setStateQueue: Dispatch<SetStateAction<ConnectionStateType[]>>; 
    lastBinaryData: Blob | null;
}

interface ConnectionStateType {
    action: string;
    device_id: string;
}

const WebSocketContext = createContext<WebSocketContextType>({
    isConnected: false,
    status:"disconnected",
    stateQueue: [],
    setStateQueue: () => {},
    lastBinaryData: null
})

export const WebSocketProvider: React.FC<{children: ReactNode}> = ({children}) => {
    
    const ws = useRef<WebSocket | null>(null);
    const isMounted = useRef(true);
    
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("disconnected");
    const [stateQueue, setStateQueue] = useState<ConnectionStateType[]>([]);
    const [lastBinaryData, setLastBinaryData] = useState<Blob | null>(null);
    

    useEffect(() => {

        if(user){
            console.log("Websocket connecting...");
            isMounted.current = true;
            setStatus("connecting");


            const requestURI = `ws://${process.env.NEXT_PUBLIC_BACKEND_HOSTNAME}:${process.env.NEXT_PUBLIC_BACKEND_PORT}/api/user/ws/${user.id}`;
            const websocket = new WebSocket(requestURI);
            ws.current = websocket;

    
            websocket.onopen = () => {
                if(isMounted.current){
                    setIsConnected(true);
                    setStatus("connected");
                    console.log('WebSocket connected');
                }
            }
    
            websocket.onmessage = (event) => {
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

                                const { device_id, status } = data;
                                console.log(`OTA status: ${status} for device: ${device_id}`);
                                if(status === "RECEIVED"){
                                    setStateQueue(prev => [...prev, { action: "BUSY", device_id}]);
                                }else if(status === "COMPLETED"){
                                    setStateQueue(prev => [...prev, { action: "CONNECTED", device_id}]);
                                }else if(status === "ERROR"){
                                    setStateQueue(prev => [...prev, { action: "CONNECTED", device_id}]);
                                }

                            }else if(data.action === "MODE_SWITCH"){

                                const { device_id, status } = data;
                                console.log(`MODE_SWITCH status: ${status} for device: ${device_id}`);
                                if(status === "RECEIVED"){
                                    setStateQueue(prev => [...prev, { action: "BUSY", device_id}]);
                                }else if(status === "COMPLETED"){
                                    setStateQueue(prev => [...prev, { action: "CONNECTED", device_id}]);
                                }else if(status === "ERROR"){
                                    setStateQueue(prev => [...prev, { action: "CONNECTED", device_id}]);
                                }

                            }else{
                                console.error("Invalid websocket message...");
                            }
                        }catch(error){
                            console.error("Failed to parse JSON: ", error);
                        }

                    }else if(event.data instanceof Blob || event.data instanceof ArrayBuffer){
                        console.log("Received Binary Data");
                        
                        let binaryBlob: Blob;
                        if (event.data instanceof ArrayBuffer){
                            binaryBlob = new Blob([event.data]);
                        }else {
                            binaryBlob = event.data;
                        }
                        setLastBinaryData(binaryBlob);
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
        <WebSocketContext.Provider value={{isConnected, status, stateQueue, setStateQueue, lastBinaryData}}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWs = () => {
    return useContext(WebSocketContext);
}