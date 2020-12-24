const webhook = require("webhook-discord");
const axios = require("axios");
const pdfreader = require("./readPDF.js");
const min = require("./Sites/MinSaude.js");
const minSaudeSite = require("./Sites/MinSaude.js");
const dgsSite = require("./Sites/Dgs.js");
const infoculSite = require("./Sites/Infocul.js");
const configDiscord = require("./configDiscord.json");
const configTelegram = require("./configTelegram.json");

const webhooks = [];
var lastNumber;
var found = false;
var varerror=0;


addHooks();
startMessage();

function repeat() {
  if (!found) {
    console.log("Checking");
    var date = new Date();

    var hour = date.getUTCHours();

    if (hour > 10 && hour < 16) { //Start checking at 12AM (UTC+1)
      varerror=0;
      check();
    }else{
      setTimeout(function(){
        repeat();
       },1000*60*10); //10 min 
    }
  }
}

async function check() {
  var data = new Date();

  var year = parseInt(data.getFullYear());
  var month = parseInt(data.getUTCMonth()) + 1;
  var day = parseInt(data.getUTCDate());

  if(day<10){
    day="0"+day;
  }
  var min="https://covid19.min-saude.pt/wp-content/uploads/"+year+"/" +month +"/" +lastNumber +"_DGS_boletim_" +year +month +day +".pdf";
  var dgs ="https://www.dgs.pt/em-destaque/relatorio-de-situacao-n-" +lastNumber + "-" +  day + month + year + "-pdf.aspx";
  var infocul = "https://infocul.pt/wp-content/uploads/"+year+"/"+month+"/"+lastNumber+"_DGS_boletim_"+year+month+day+".pdf";

  console.log(min);
  console.log(dgs);
  console.log(infocul);
  var siteRes;

  if(!found){
  siteRes= await minSaudeSite.get(min);
  console.log("res min "+siteRes);
  if(siteRes){
    resetTimerAndCallSuccess(min);
  }else if(!found){
    siteRes=await dgsSite.get(dgs);
    console.log("res dgs "+siteRes);
      if(siteRes){
        resetTimerAndCallSuccess(dgs);
      }else if (!found){
        siteRes= await infoculSite.get(infocul);
        console.log("res info "+siteRes);
          if(siteRes){
            resetTimerAndCallSuccess(infocul);
          }else{
            //recheck again
            console.log("Checking in 10 seconds");
            setTimeout(function(){
              repeat();
            },10000)
            
          }
      }
  }
}
}


function resetTimerAndCallSuccess(link){
  found=true;
  success(link);
  var data = new Date();
  data.setHours(data.getHours() + 19);
  console.log("Checking again at " + data.toUTCString());

  setTimeout(function () {
      found = false;
      lastNumber++;
      repeat();
  }, 1000 * 60 * 60 * 19); //19 hours later

}


async function success(link) {
  var res=await pdfreader.read(link);
  var msg;
  if(res != undefined){
     msg = new webhook.MessageBuilder()
        .setName("DGS Covid Boletim Diário")
        .setColor("#aabbcc")
        .setAvatar("https://www.farrer.co.uk/globalassets/coronavirus-low-res.jpg")
        .setText("Found a new report!\n" + "Confirmados "+res[1]+"\n"+ "Em Vigilância "+res[0]+"\n"+ "Recuperados "+res[2]+"\n"+ "Ativos "+res[3]+"\n"+ "Óbitos "+res[4]+"\n")
        .setDescription(link);
  }else{
    console.log(res);
     msg = new webhook.MessageBuilder()
        .setName("DGS Covid Boletim Diário")
        .setColor("#aabbcc")
        .setAvatar("https://www.farrer.co.uk/globalassets/coronavirus-low-res.jpg")
        .setText("Found a new report!")
        .setDescription(link);
  }
    for (var i = 0; i < webhooks.length; i++) {
      webhooks[i].send(msg);
    }

    var strToTelegram = "Found a new report!\n" + "Confirmados "+res[1]+"\n"+ "Em Vigilância "+res[0]+"\n"+ "Recuperados "+res[2]+"\n"+ "Ativos "+res[3]+"\n"+ "Óbitos "+res[4]+"\n"+"\n"+link;


    for (var i=0;i<configTelegram.length;i++){
      console.log(configTelegram[i].botIdAndToken);
      try{
        await messageToTelegramChannel(configTelegram[i].botIdAndToken,configTelegram[i].chatId,strToTelegram);
      } catch (e){
        console.log("Error sending to telegram  Id:"+configTelegram[i].chatId);
      }
    }





  }



function startMessage() {
  var data = new Date();
  var msg = new webhook.MessageBuilder()
    .setName("DGS Covid Boletim Diário")
    .setColor("#aabbcc")
    .setAvatar("https://www.farrer.co.uk/globalassets/coronavirus-low-res.jpg")
    .setText("Waiting for a new report ! ")
    .setDescription("Started at " + data.toUTCString());

      webhooks[0].send(msg);

  setReportNumberAndStart();


}


async function messageToTelegramChannel(botIdandToken,chId,str){
  await axios.get("https://api.telegram.org/bot"+botIdandToken+"/sendMessage?chat_id="+chId+"&text="+encodeURIComponent(str));

}


function addHooks() {
  for (var i=0;i<configDiscord.length;i++){
    var hook = new webhook.Webhook(configDiscord[i].webhook);
    webhooks.push(hook);
  }

}


function setReportNumberAndStart(){
  data = new Date();
  var aNumber=239; //27
  let aDate = new Date(2020, 9, 27, 12, 0, 0, 0);
  aDate.setHours(data.getUTCHours());
  aDate.setMinutes(data.getUTCMinutes());

  var toAdd=Math.round((data-aDate)/1000/60/60/24);
  lastNumber=aNumber+toAdd;

  console.log(lastNumber+" V2.0");
  console.log(data.toUTCString());

  repeat();

}