import { useState, useEffect, useRef, useContext, createContext, ReactNode } from "react";
import { useAuth } from "./AuthContext";


interface WebSocketContextType {
    isConnected: boolean;
    status: string;
    sendMessage: (message: string) => void;
    lastMessage: string | null;
    lastBinaryData: Blob | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
    isConnected: false,
    status:"disconnected",
    sendMessage: (message: string) => {},
    lastMessage: null,
    lastBinaryData: null
})

export const WebSocketProvider: React.FC<{children: ReactNode}> = ({children}) => {
    
    const ws = useRef<WebSocket | null>(null);
    const isMounted = useRef(true);
    
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("disconnected");
    const [lastMessage, setLastMessage] = useState<string>("");
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
                        console.log("Received JSON sting");
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


    const sendMessage = (message: string) => {

    }


    return (
        <WebSocketContext.Provider value={{isConnected, status, sendMessage, lastMessage, lastBinaryData}}>
            {children}
        </WebSocketContext.Provider>
    )
}

export const useWs = () => {
    return useContext(WebSocketContext);
}