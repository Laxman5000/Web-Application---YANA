const subscriptions = require('../model/subscriptionModel');
var crypto = require("crypto");
const webpush = require("web-push");
const cron = require('node-cron');



const vapidKeys = {
  privateKey: "bdSiNzUhUP6piAxLH-tW88zfBlWWveIx0dAsDO66aVU",
  publicKey: "BIN2Jc5Vmkmy-S3AUrcMlpKxJpLeVRAfu9WBqUbJ70SJOCWGCGXKY-Xzyh7HDr6KbRDGYHjqZ06OcS3BjD7uAm8"
};



webpush.setVapidDetails("mailto:example@yourdomain.org", vapidKeys.publicKey, vapidKeys.privateKey);

function createHash(input) {
  const md5sum = crypto.createHash("md5");
  md5sum.update(Buffer.from(input));
  return md5sum.digest("hex");
}

async function handlePushNotificationSubscription(req, res) {
// console.log("llll")
  const subscriptionRequest = req.body;
  const susbscriptionId = createHash(JSON.stringify(subscriptionRequest));
  subscriptionRequest.id = susbscriptionId;
  const subs = await subscriptions.findOne({id: susbscriptionId}).catch(err =>err);
  if(!subs){
    await subscriptions.create(subscriptionRequest).catch(err =>err);
  }
  res.status(201).json({ id: susbscriptionId });
}

async function sendPushNotification(req, res) {
  const subscriptionId = req.body.id?.id;
  const notification = req.body.notification;
  const pushSubscription = await subscriptions.findOne({ id: subscriptionId });

  if(pushSubscription){
    webpush
      .sendNotification(
        pushSubscription,
        JSON.stringify(notification),
      )
      .catch(err => {
        console.log(err);
      });
  
    res.status(202).json({});
  }
}

cron.schedule('59 * * * *', async function() {
    console.log('running a task every minute');
    const subs = await subscriptions.find({});
    subs.map(function(subscription) {
    webpush
      .sendNotification(
        subscription,
        JSON.stringify({
          title: "Check Latest News",
          image: "/images/square.png",
          tag: "latest-news",
          url: "blogs"
      }),
      )
      .catch(err => {
        console.log(err);
      });
    });
});

module.exports = { handlePushNotificationSubscription, sendPushNotification };
