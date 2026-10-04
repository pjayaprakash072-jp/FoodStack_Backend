const sendWhatsAppMessage = async(phone,name)=>{
    const url = `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}`+`/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const response = await fetch(url,{
        method:"POST",
        headers:{
            "Authorization":`Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type":"application/json"
        },
        body:JSON.stringify(
            {
                messaging_product:"whatsapp",
                to:phone,
                type:"template",
                template:{
                    name:"Welcome_message",
                    language:{
                        code:"en_US"
                    },
                    components:[
                        {
                            type:"body",
                            parameters:[
                                {
                                    type:"text",
                                    text:name
                                }
                            ]
                        }
                    ]
                }
            }
        )
    })
    const data = await response.json();
    if(!response.ok){
        throw new Error(
            data.error?.message || "WhatsApp message failed"
        )
    }
    return data;
}
module.exports =  sendWhatsAppMessage;