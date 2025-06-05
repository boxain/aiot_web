import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const modelSwitchAPI = async (device_id: string, model_id: string) => {
    try{

        const requestURI = `${process.env.NEXT_PUBLIC_BACKEND_HOSTNAME}/api/device/model_switch/${device_id}/${model_id}`;
        const access_token = Cookies.get("access_token");
        const token_type = Cookies.get("token_type");
        
        const headers = {
            headers: {
                "Authorization": `${token_type} ${access_token}`
            }
        }


        const response = await axios.get(requestURI, headers);
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

export default modelSwitchAPI