import { useState, useEffect } from "react";
// import http from "./utils/http";
//the function to call the push server: https://github.com/Spyna/push-notification-demo/blob/master/front-end-react/src/utils/http.js

import {
  isPushNotificationSupported,
  askUserPermission,
  registerServiceWorker,
  createNotificationSubscription,
  getUserSubscription
} from "./push-notifications";
import http from "./utils/http";
// import { json } from "body-parser";
// import { use } from "./app";
//import all the function created to manage the push notifications


const pushNotificationSupported = isPushNotificationSupported();
//first thing to do: check if the push notifications are supported by the browser



export default function usePushNotifications() {
  const [userConsent, setSuserConsent] = useState(Notification.permission);
  //to manage the user consent: Notification.permission is a JavaScript native function that return the current state of the permission
  //We initialize the userConsent with that value
  const [userSubscription, setUserSubscription] = useState(null);
  //to manage the use push notification subscription
  const [pushServerSubscriptionId, setPushServerSubscriptionId] = useState();
  //to manage the push server subscription
  const [error, setError] = useState(null);
  //to manage errors
  const [loading, setLoading] = useState(true);
  //to manage async actions

  useEffect(() => {
    if (pushNotificationSupported) {
      setLoading(true);
      setError(false);
      registerServiceWorker().then(() => {
        setLoading(false);
      });
    }
  }, []);
  //if the push notifications are supported, registers the service worker
  //this effect runs only the first render
  
  useEffect(() => {
    if (pushNotificationSupported) 
    {setLoading(true);
    setError(false);
    const getExixtingSubscription = async () => {
      const existingSubscription = await getUserSubscription();
      setUserSubscription(existingSubscription);
      setLoading(false);
    };
    getExixtingSubscription();
  }
  }, []);
  //Retrieve if there is any push notification subscription for the registered service worker
  // this use effect runs only in the first render

  /**
   * define a click handler that asks the user permission,
   * it uses the setSuserConsent state, to set the consent of the user
   * If the user denies the consent, an error is created with the setError hook
   */
  async function onClickAskUserPermission () {
    setLoading(true);
    setError(false);
    await askUserPermission().then(consent => {
      setSuserConsent(consent);
      if (consent !== "granted") {
        setError({
          name: "Consent denied",
          message: "You denied the consent to receive notifications",
          code: 0
        });
      }
      setLoading(false);
    });
  };
  //

  /**
   * define a click handler that creates a push notification subscription.
   * Once the subscription is created, it uses the setUserSubscription hook
   */
  async function onClickSusbribeToPushNotification(){
    setLoading(true);
    setError(false);
    let userSubscription = {}
    await createNotificationSubscription()
      .then(function(subscrition) {
        localStorage.setItem('subs',JSON.stringify(subscrition));
        setUserSubscription(subscrition);
        userSubscription = subscrition
        setLoading(false);
      })
      .catch(err => {
        console.error("Couldn't create the notification subscription", err, "name:", err.name, "message:", err.message, "code:", err.code);
        setError(err);
        setLoading(false);
      });
      return userSubscription;
  };

  /**
   * define a click handler that sends the push susbcribtion to the push server.
   * Once the subscription ics created on the server, it saves the id using the hook setPushServerSubscriptionId
   */
  async function onClickSendSubscriptionToPushServer(userSubscription){

    setLoading(true);
    setError(false);
   
    let serverSubscriptionId = {}
    await http.post("/subscription", userSubscription)
      .then(function(response) {
        // console.log(response);
        serverSubscriptionId = {
          "endpoint":userSubscription.endpoint,
          "options":userSubscription.options,
          "id": response.id
        };
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        setError(err);
      });
      return serverSubscriptionId;
      
  };

  /**
   * define a click handler that request the push server to send a notification, passing the id of the saved subscription
   */
  const onClickSendNotification = async(pushServerSubscriptionId,notification) => {
    setLoading(true);
    setError(false);
    // console.log(pushServerSubscriptionId);
   
     await http.post("/subscriptionpost", {id:pushServerSubscriptionId, notification:notification}).catch(err => {
      setLoading(false);
      setError(err);
    }).then(res=> res);
    // http.post("https://pushpad.xyz/api/v1/projects/7340/notifications",opt).catch(err => {
    //     setLoading(false);
    //     setError(err);
    //   });
    setLoading(false);
  };

  /**
   * returns all the stuff needed by a Component
   */
  return {
    onClickAskUserPermission,
    onClickSusbribeToPushNotification,
    onClickSendSubscriptionToPushServer,
    pushServerSubscriptionId,
    onClickSendNotification,
    userConsent,
    pushNotificationSupported,
    userSubscription,
    error,
    loading
  };
}
