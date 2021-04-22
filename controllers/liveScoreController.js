const axios = require('axios');
const cheerio =  require('cheerio');

function findFirstUpperCase(str)
{
    for(let i = 2; i < str.length; i++ ) {
        let c= str[i];
        if(c === c.toUpperCase())
            return i;
    }
}

function getScores(str) {
    let dashCount = 0;
    for(let i = 0; i < str.length; i++) {
        if(str[i] === "*")
            dashCount += 1;
        if(dashCount == 3) {
            str = str.substring(i+1);
            break;
        }
    }
    let scores = [];
    while(scores.length <= 4) {
        scores.push(str.substring(0, str.indexOf("*")))
        str = str.substring(str.indexOf("*")+1)
    }
    return scores;
}


module.exports = async function(io, url) {
        const {data} = await axios.get(url);
        const $ = await cheerio.load(data);
        let liveGameInfo = [];
        $("table").each(function(index, value) {
            let teams = $(this).find(".team a").text().replace(/[\W_]+/g,"");
            let team1 = teams.substring(0, findFirstUpperCase(teams))
            let team2 = teams.substring(findFirstUpperCase(teams));
            let isPushed = false;
            $(this).find("td").each((idx, val) => {
                if(!isPushed && $(this).text().replace(/[\W_]+/g, " ").substring(0, 10) === " 1 2 3 4 T"){
                    let scores = $(this).text().replace(/[\W_]+/g, "*");
                    let team1StartingIndex = scores.indexOf(team1) + team1.length 
                    let team1String = scores.substring(team1StartingIndex, scores.indexOf(team2));
                    let team2StartingIndex = scores.indexOf(team2) + team2.length 
                    let team2String = scores.substring(team2StartingIndex);
                    const team1Scores = getScores(team1String);
                    const team2Scores = getScores(team2String);
                    gameInfo = {
                        "team1": team1,
                        "team2": team2,
                        "team1Scores": team1Scores,
                        "team2Scores": team2Scores
                    }
                    isPushed = true;
                    liveGameInfo.push(gameInfo);
                }
            })
    
        })
        console.log("Scores Updated!");
        io.emit("score change", liveGameInfo);
        return liveGameInfo;
}