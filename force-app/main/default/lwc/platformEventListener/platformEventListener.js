import { LightningElement,track } from "lwc";
import {
  subscribe,
  unsubscribe,
  onError,
  setDebugFlag,
  isEmpEnabled,
} from "lightning/empApi";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import PublishPlatformEvent from '@salesforce/apex/PublishPlatformEvents.PublishPlatformEvent';

export default class EmpApiLWC extends LightningElement {
  get options() {
    return [
        { label: 'Account', value: 'Account' },
        { label: 'Contact', value: 'Contact' }
    ];
  } 
  channelName =
    "/event/PlatformEvent__e";
  isSubscribeDisabled = false;
  isUnsubscribeDisabled = !this.isSubscribeDisabled;

  subscription = {};
  objectApiName = 'Account';
  eventPayload;
  className = 'slds-show';
  // Tracks changes to channelName text field
  handleChannelName(event) {
    this.channelName = event.target.value;
  }

  handleRecordSelection(event) {
    console.log("the selected record id is" + event.detail);
    if(event.detail != undefined && event.detail !='' && event.detail != null){
      PublishPlatformEvent({recordId: event.detail, objName: this.objectApiName})
      .then(response =>{
        console.log('SUCCESS');
      })
      .catch(error => {
        console.log('ERROR', JSON.stringify(error));
      })
      
    }
  }
  // Initializes the component
  connectedCallback() {
    // Register error listener
    this.registerErrorListener();
  }

  // Handles subscribe button click
  handleSubscribe() {
    // Callback invoked whenever a new event message is received
    const self = this;
    const messageCallback = function (response) {
      console.log('Payload: ', JSON.stringify(response));
      self.eventPayload = JSON.stringify(response);
      // Response contains the payload of the new message received
    };

    // Invoke subscribe method of empApi. Pass reference to messageCallback
    subscribe(this.channelName, -1, messageCallback).then((response) => {
      // Response contains the subscription information on subscribe call
      console.log(
        "Subscription request sent to: ",
        JSON.stringify(response.channel)
      );
      this.subscription = response;
      this.toggleSubscribeButton(true);
    });
  }

  // Handles unsubscribe button click
  handleUnsubscribe() {
    this.toggleSubscribeButton(false);

    // Invoke unsubscribe method of empApi
    unsubscribe(this.subscription, (response) => {
      console.log("unsubscribe() response: ", JSON.stringify(response));
      // Response is true for successful unsubscribe
    });
  }

  toggleSubscribeButton(enableSubscribe) {
    this.isSubscribeDisabled = enableSubscribe;
    this.isUnsubscribeDisabled = !enableSubscribe;
  }

  registerErrorListener() {
    // Invoke onError empApi method
    onError((error) => {
      console.log("Received error from server: ", JSON.stringify(error));
      // Error contains the server-side error
    });
  }
  handleChange(event){
    this.objectApiName = event.detail.value;
    console.log(this.objectApiName);
  }
}