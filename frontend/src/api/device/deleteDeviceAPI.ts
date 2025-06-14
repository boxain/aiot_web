import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const deleteDevicesAPI = async (device_ids: string[]) => {
    const requestURI = `${process.env.NEXT_PUBLIC_BACKEND_HOSTNAME}/api/device/delete-many`;
    const access_token = Cookies.get("access_token");
    const token_type = Cookies.get("token_type");
    
    const headers = {
        headers: {
            "Authorization": `${token_type} ${access_token}`,
            "Content-Type": "application/json",
        }
    }

    const body = {
        device_ids: device_ids
    }

    const response = await axios.post(requestURI, body, headers);
    return response.data;
}

export default deleteDevicesAPI