import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const inferenceAPI = async (device_id: string) => {
    const requestURI = `${process.env.NEXT_PUBLIC_BACKEND_HOSTNAME}/api/device/inference/${device_id}`;
    const access_token = Cookies.get("access_token");
    const token_type = Cookies.get("token_type");
    
    const headers = {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${token_type} ${access_token}`
        }
    }

    const response = await axios.get(requestURI, headers);
    return response.data;
}

export default inferenceAPI