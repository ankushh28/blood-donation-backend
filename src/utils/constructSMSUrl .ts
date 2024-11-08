import { config } from "../config/config";

export const constructSMSUrl = (receiver: string, message: string) => {
    const { KALEYRA_KEY, SENDER, TEMPID} = config;
    const encodedMessage = encodeURIComponent(message);
    return `https://api-alerts.kaleyra.com/v4/?api_key=${KALEYRA_KEY}&method=sms&message=${encodedMessage}&to=${receiver}&sender=${SENDER}&template_id=${TEMPID}`
};

