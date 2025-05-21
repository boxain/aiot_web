import { useState, useEffect, useRef } from "react";
import { ListChecks } from "lucide-react";


const DeviceLog = () => {
    const logContainerRef = useRef<HTMLDivElement>(null);
    const [logs, setLogs] = useState<string[]>([
        "[INFO] System initialized successfully.",
        "[INFO] WiFi connected, IP: 192.168.1.100",
        "[INFO] Inference engine loaded.",
        "[EVENT] Motion detected.",
        "[INFERENCE] Bird detected: Sparrow (Confidence: 92%).",
        // Add more initial logs if needed
    ]);

    useEffect(() => {
        if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    // useEffect(() => {
    //   const intervalId = setInterval(() => {
    //     const newLog = `[TIME] ${new Date().toLocaleTimeString()} - Log entry example.`;
    //     setEsp32Logs(prevLogs => [...prevLogs, newLog].slice(-100)); // Keep last 100 logs
    //   }, 5000); // Add a new log every 5 seconds
    //   return () => clearInterval(intervalId);
    // }, []);


    return (
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col flex-grow min-h-[300px] hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <ListChecks className="w-6 h-6 mr-2 text-indigo-500" /> Device Log
            </h2>
            <div ref={logContainerRef} className="bg-gray-800 text-gray-200 p-4 rounded-lg font-mono text-xs flex-1 overflow-y-auto h-64 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900">
                {logs.map((log, index) => (
                    <p key={index} className="mb-1 whitespace-pre-wrap break-all">
                    <span className={`mr-2 ${log.includes("[ERROR]") ? "text-red-400" : log.includes("[WARNING]") ? "text-yellow-400" : log.includes("[INFO]") ? "text-blue-400" : log.includes("[EVENT]") ? "text-green-400" : "text-gray-400"}`}>
                        {log.split("]")[0]}
                    </span>
                    {log.split("]").slice(1).join("]")}
                    </p>
                ))}
                <div className="h-2"></div>
            </div>
        </div>
    )
}

export default DeviceLog;