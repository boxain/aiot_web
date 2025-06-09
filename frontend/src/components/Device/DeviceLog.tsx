import { useEffect, useRef } from "react";
import { DeviceLogsSectionProps } from "@/components/device/types";
import { useWs, DeviceLogType } from "@/context/WebSocketContext";
import { ListChecks } from "lucide-react";

const DeviceLog: React.FC<DeviceLogsSectionProps> = ({ device_id }) => {
    const { deviceLogs } = useWs();
    const logContainerRef = useRef<HTMLDivElement>(null);
    const currentLogs = deviceLogs[device_id] || [];

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [currentLogs]);


    const logStyle = (level: string) => {
        switch (level) {
            case "error":
                return "text-red-400";
            case "warning":
                return "text-yellow-400";
            case "event":
                return "text-green-400";
            default:
                return "text-blue-400";
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col flex-grow h-[300px] hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <ListChecks className="w-6 h-6 mr-2 text-indigo-500" /> Device Log
            </h2>
            <div ref={logContainerRef} className="bg-gray-800 text-gray-200 p-4 rounded-lg font-mono text-xs flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900 min-h-0">
                {currentLogs.map((log: DeviceLogType, index) => (
                    <p key={`${device_id}-log-${index}`} className="mb-1 whitespace-pre-wrap break-all">
                        <span className={`mr-2 ${logStyle(log.level)}`}>
                            {`[${log.level.toUpperCase()}]`}
                        </span>
                        {log.message}
                    </p>
                ))}
                <div className="h-2"></div>
            </div>
        </div>
    );
};

export default DeviceLog;