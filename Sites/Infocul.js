const axios = require("axios");
module.exports = {
    get: async function (link){
       var res;
        await axios.get(link)
        .then(function (response) {

            if((parseInt(response.status))==200){
                res = true;
            }else{
                res = false;
            }

        })
        .catch(function (error){
            res=false;
            return res;
        });
        return res;
    }
};
