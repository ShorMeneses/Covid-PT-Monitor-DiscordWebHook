const axios = require("axios");
module.exports = {
    get: async function (link){
        var res;
        await axios.get(link,{timeout:15000})
        .then(function (response) {
          
          redirects=((parseInt(response.request._redirectable._redirectCount)));
          if((parseInt(response.request._redirectable._redirectCount)==0)){
            res = true;
          }else{
              res = false;
          }
        })
        return res;
    }
};
