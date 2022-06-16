'use strict';

const Obniz = require("obniz");
const obniz = new Obniz("7047-3715", { access_token:"tpmU36Yu9Y4yc8BD6PVSrImgRe05FAGP1aCxN5Y2H8ENRTwXsowAELebm6s1Prh2" })
const line = require('@line/bot-sdk');

const config = {
    channelSecret: '2e4bb07aae3ede771cbc09741b00a44f',
    channelAccessToken: 'z1H14uDvioPz200e9fdCB1qn6ZtVOTREd3XwL8RJiYIC+P3Dn7Q6qGyq220Ke365i9Yix3vssmrtiUMphMMw6+b/bd9WFEWv9Ne8QQ9n3xVaa5STzJfBZaVdLmtTihpQnLWoPcde2nGn7FtlgIaYQgdB04t89/1O/w1cDnyilFU='
};
const client = new line.Client(config);

let msg = '';

obniz.onconnect = async function () {
    const hcsr04 = obniz.wired("HC-SR04", {gnd:0, echo:1, trigger:2, vcc:3});
    var servo = obniz.wired("ServoMotor", { gnd: 4, vcc: 5, signal: 6 });
    var light = obniz.wired("Keyestudio_TrafficLight", {gnd:8, green:9, yellow:10, red:11});
    let angle = 0;
    let cnt = 5;
    setInterval(async function () {
        let distance = 0;
        let count = 0;
        for (let i=0; i < 3; i++) {
            const val = await hcsr04.measureWait();
            if (val) {
            count++;
            distance += val;
            }
        }
        if (count > 1) {
            distance /= count;
        }
        console.log(distance);
        obniz.display.clear();
        angle = angle + cnt;
        servo.angle(angle);
        if(angle > 180){
            angle = 180;
            cnt = cnt * -1;
        }else if(angle < 0){
            angle = 0;
            cnt = cnt * -1;
        }
        if (distance < 100){
            light.single("red");
            msg = 'Something is detected!';
            obniz.display.print(msg);
            await main();
        }else if(distance < 500){
            light.single("yellow");
            msg = 'Maybe something nearby...';
            obniz.display.print(msg);
        }else{
            light.single("green");
            msg = 'No problem.';
            obniz.display.print(msg);
        }
    }, 1000);
  };

const main = async () => {
    const messages = [{
        type: 'text',
        text: msg
    }];

    try {
        const res = await client.broadcast(messages);
        console.log(res);        
    } catch (error) {
        console.log(`エラー: ${error.statusMessage}`);
        console.log(error.originalError.response.data);
    }
}