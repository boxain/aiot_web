import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const switchModeAPI = async (device_id: string, mode: string) => {
    try{

        const requestURI = `http://${process.env.NEXT_PUBLIC_BACKEND_HOSTNAME}:${process.env.NEXT_PUBLIC_BACKEND_PORT}/api/device/mode_switch/${device_id}`;
        const access_token = Cookies.get("access_token");
        const token_type = Cookies.get("token_type");
        
        const headers = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${token_type} ${access_token}`
            }
        }

        const requestBody = { mode}
        const response = await axios.post(requestURI, requestBody, headers);
        return response.data;


    }catch(error: any){

        if(error.response){
            return error.response.data
        }else {
            return {
                success: false,
                message: error.message
            }
        }

    }
}

export default switchModeAPI