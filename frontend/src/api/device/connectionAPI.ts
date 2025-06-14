import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const connectionDeviceAPI = async (ssid: string, password: string) => {
    const requestURI = `${process.env.NEXT_PUBLIC_BACKEND_HOSTNAME}/api/device/connection`;
    const access_token = Cookies.get("access_token");
    const token_type = Cookies.get("token_type");
    
    const headers = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${token_type} ${access_token}`
        }
    }

    const requestBody = { ssid, password }
    const response = await axios.post(requestURI, requestBody, headers);
    return response.data;
}

export default connectionDeviceAPI