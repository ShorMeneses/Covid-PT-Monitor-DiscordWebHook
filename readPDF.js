const crawler = require("crawler-request");
var confirmados;

function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
}


module.exports = {
    read: async function (link){
        console.log(link);

        await crawler(link).then(function(data) {
            //use new format
            try{


            var expressionResult =data.text.toString();


            var ini=getPosition(expressionResult,"CONFIRMADOS",2);
            var fim= expressionResult.indexOf("COVID-19");
             confirmados=(expressionResult.substr(ini,fim-ini));


            confirmados=confirmados.replace("\n"," ");
            console.log(confirmados);

            }catch (e){
                return undefined;
            }

        });
        return confirmados;
    }
};








