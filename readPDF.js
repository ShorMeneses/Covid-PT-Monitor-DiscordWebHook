const crawler = require("crawler-request");
var resArray = [];

function getPosition(string, subString, index) {
    return string.split(subString, index).join(subString).length;
}

module.exports = {
    read: async function (link) {
        console.log(link);

        await crawler(link).then(function (data) {
            try {
                var expressionResult = data.text.toString();
                var array = (expressionResult.split("\n"));

                for (var i = 0; i < array.length; i++) {
                    if (array[i].includes('COVID-19 | RELATÓRIO DE SITUAÇÃO')) {
                        resArray.push(array[i + 1]);
                        resArray.push(array[i + 2]);
                        resArray.push(array[i + 3]);
                        resArray.push(array[i + 4]);
                        resArray.push(array[i + 5]);
                        break;
                    }
                }
                return resArray
            } catch (e) {
                return undefined;
            }

        });

        return resArray
    }
};