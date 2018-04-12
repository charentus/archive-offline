import { Component, OnInit, Inject, ViewChild, ElementRef } from "@angular/core";
//import { EversuiteService } from "../../shared/eversuite.service";
//import { ConfigServer } from "../../shared/configserver";
import {DatabaseService } from "../../providers/database.service";
//import { Couchbase } from "nativescript-couchbase";

import { BarcodeScanner } from 'nativescript-barcodescanner';
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "tns-core-modules/ui/page/page";
import { Image } from "ui/image";
import { FlexboxLayout } from "ui/layouts/flexbox-layout";
//import { ScrollEventData } from "ui/scroll-view";
import { ActionBar } from "tns-core-modules/ui/action-bar/action-bar";

//import { registerElement } from "nativescript-angular/element-registry";
import * as dialogs from "ui/dialogs";
export interface scanItem {
    code: string;
    type: string;
};


@Component({
    selector: "ns-infos",
   // providers: [EversuiteService],
    moduleId: module.id,
    templateUrl: "./main.component.html",
    styleUrls: ["./main-common.css", "./main.css"]
})


export class MainComponent implements OnInit {



    public actions:any;
    //UI
    public currentAction: string;
    public instructions: string;
    public title:string = "";
    public showAction:boolean = false;


    //temporary variables
    //used for place and recol
    public curPosition:string = "";
    public curItems:string[] = [];
    // used for externalize
    public curExt:string;


    public curAct : any;

    public desc: string;
    infos:any = [];

    scannedItems:scanItem[] =  [];




    // This pattern makes use of Angular’s dependency injection implementation to inject an instance of the infoservice service into this class. 
    // Angular knows about this service because it is included in your app’s main NgModule, defined in app.module.ts.
    constructor(private page: Page,
                //private eversuiteService: EversuiteService, 
                private databaseService: DatabaseService, 
                private barcodeScanner: BarcodeScanner, 
                private routerExtensions: RouterExtensions) {

                 // registerElement("BarcodeScanner", () => require("nativescript-barcodescanner").BarcodeScannerView);

                }

    ngOnInit(): void {
        this.showAction = false;
        this.actions = [{code:"INFO", label:"Informations", inst:"Scan barcode to get details", callbackScanButton : () => {this.scanInfo();}},
                    {code:"PLACE", label:"Place into storage", inst:"Scan a position first, then as many item you want to locate into it", callbackScanButton : () => {this.scanBulk(this, this.callBackPlace);}},
                    {code:"RECOL", label:"Recolment onto postions", inst:"Scan a position first, then as many item you want to recol", callbackScanButton : () => {this.scanBulk(this, this.callBackRecol);}},
                    {code:"LOAN_OUT", label:"loan (out from storage)",inst:"Scan items to be lend (i.e. going out of storage)"},
                    {code:"LOAN_IN", label:"loan (back to storage)", inst:"Scan items returning to storage ( loan ending)"},
                    {code:"DESTRUC", label:"Destruction confirme", inst:"Scan items you remove from storage to destruct"},
                    {code:"EXT_PRO", label:"Externalize proposal", inst:"Scan items you propose to externalize", callbackScanButton : () => {this.scanBulk(this, this.callBackExtePropose);}},
                    {code:"EXT_CONF", label:"Externalize confirmation", inst:"Scan items ", callbackScanButton : () => {this.scanBulk(this, this.callBackExteConfirm);}} ];
        this.curAct = this.actions[0];
        this.curPosition = null;

        this.refreshUI(0);

    }

    refreshUI(act?:number) {
        if (act != null) {
            this.curAct = this.actions[act];
        }
        this.currentAction = this.curAct.label;
        this.instructions = this.curAct.inst;
        this.title = "";

    }


    addAction(code:string, action:any) {
        let acc:any = {};
        if (code == "PLACE") {
            let doc_code = code+"_ù_"+action.item;
            //addAction("PLACE", {position:me.curPosition,item:item.code});
            acc = this.databaseService.getActionFromDB(doc_code) || {};
            acc.type = "action";
            acc.time = new Date().getTime();

            acc.position = action.position;
            acc.item = action.item;
            acc.synchro = "todo"; //todo,done,error
            acc.action = "PLACE";
            this.databaseService.setDocument(doc_code, acc);
            //UI update
            this.infos.splice(0,0,{name: acc.item , value:"Placed on " + acc.position});

        }
        if (code == "RECOL") {
            let doc_code = code+"_ù_"+action.position;
            //addAction("RECOL", {position:me.curPosition,items:[code...]});
            acc = this.databaseService.getActionFromDB(doc_code) || {};
            acc.type = "action";
            acc.action = "RECOL";
            acc.time = new Date().getTime();

            acc.position = action.position;
            acc.item = action.item;
            acc.synchro = "todo"; //todo,done,error
            this.databaseService.setDocument(doc_code, acc);
            //UI update
            let det = "contains : ";
            for(let c of action.items) {
                det += "\n   - "+ c;
            }
            this.infos.splice(0,0,{name: acc.position , value:det});
        }
        if ((code == "EXT_PRO")||(code == "EXT_CONF")) {
            let doc_code = code+"_ù_"+action.item;
            //addAction("EXT_PRO", {externe:me.curExt,item:item.code});
            acc = this.databaseService.getActionFromDB(doc_code) || {};
            acc.type = "action";
            acc.action = code;
            acc.time = new Date().getTime();

            acc.externe = action.externe;
            acc.item = action.item;
            acc.synchro = "todo"; //todo,done,error
            this.databaseService.setDocument(doc_code, acc);
            //UI update
            let det = "externe proposed ("+ acc.externe+")";
            if (code == "EXT_CONF") {
                det = "externe confirmed ("+ acc.externe+")";
            }
            this.infos.splice(0,0,{name: acc.item , value:det});
        }

    }



// INFO
    callBackInfo(me:MainComponent, result:any) {
        //empty the screen
        me.infos.splice(0,me.infos.length);

        let informations:any = me.databaseService.getInfosfromDB(result.text, true);

          if (informations) {
            //fill screen with result
            for(let info of informations) {
                me.infos.push(info);
            }
          }
          else {
            //show error message
            me.infos.push({name:"Error", value:"Sorry, we haven't any information on for this code\n"+result.text});
          }
    }

// PLACE
    callBackPlace(me:MainComponent, result:any) {

        // on close called with result.closing:boolean = true;
        if (result.closing) {
            return;
        }

       // called after each scan
        let position:any = me.databaseService.getPositionFromDB(result.text);
        if (position) {
            me.curPosition = position.code;
            me.title = "Placing on " + position.code;
        }
        else {
            let item:any = me.databaseService.getItemFromDB(result.text);
            if (item) {
                if (me.curPosition == null) {
                    me.barcodeScanner.stop();
                    dialogs.alert({title:"Error", message:"You, should scan a position first"});
                }
                else {
                    me.addAction("PLACE", {position:me.curPosition,item:item.code});
                }
            }
            else {
                me.barcodeScanner.stop();
                dialogs.alert({title:"Error", message:"Sorry, we don't know item having this code\n"+result.text});
            }


        }

    }

// recol
    callBackRecol(me:MainComponent, result:any) {

        // on close called with result.closing:boolean = true;
        if (result.closing) {
            if (me.curPosition && (me.curItems.length > 0)) {
                me.addAction("RECOL", {position:me.curPosition,items:me.curItems});
                me.curItems = [];
            }
            return;
        }

    // called after each scan
        let position:any = me.databaseService.getPositionFromDB(result.text);
        if (position) {
            // new position
            if (me.curPosition && (me.curPosition != position.code) && (me.curItems.length > 0)) {
                me.addAction("RECOL", {position:me.curPosition,items:me.curItems});
                me.curItems = [];
            }
            
            me.curPosition = position.code;
            me.title = "Placing on " + position.code;
        }
        else {
            let item:any = me.databaseService.getItemFromDB(result.text);
            if (item) {
                if (me.curPosition == null) {
                    me.barcodeScanner.stop();
                    me.infos.push({name:"Error", value:"You, should scan a position \n"+result.text});
                }
                else {
                    me.curItems.push(item.code);
                    //me.infos.push({name:item.code, value:me.curPosition});
                }
            }
            else {
                me.barcodeScanner.stop();
                me.infos.push({name:"Error", value:"Sorry, we don't know Item having this code\n"+result.text});
            }


        }

    }

    callBackExtePropose(me:MainComponent, result:any) {
        // on close called with result.closing:boolean = true;
        if (result.closing) {
            return;
        }
        if (me.curExt == null) {
            me.barcodeScanner.stop();
            dialogs.alert({title:"Error", message:"You should choose an exren first"});
        }

        let item:any = me.databaseService.getItemFromDB(result.text);
        if (item) {
            if (item.externeEtat == 0) {
                me.addAction("EXT_PRO", {externe:me.curExt,item:item.code});
            }
            else {
                me.barcodeScanner.stop();
                dialogs.alert({title:"Error", message:"This item is already externalized..."});
            }
        }
        else {
            me.barcodeScanner.stop();
            dialogs.alert({title:"Error", message:"Sorry, we don't know item having this code\n"+result.text});
        }

    }
    callBackExteConfirm(me:MainComponent, result:any) {
        // on close called with result.closing:boolean = true;
        if (result.closing) {
            return;
        }
        if (me.curExt == null) {
            me.barcodeScanner.stop();
            dialogs.alert({title:"Error", message:"You, should choose an exren first"});
        }

        let item:any = me.databaseService.getItemFromDB(result.text);
        if (item) {
            if (item.externeEtat == 5) {
                me.addAction("EXT_CONF", {externe:me.curExt,item:item.code});
            }
            else {
                me.barcodeScanner.stop();
                dialogs.alert({title:"Error", message:"You, item already externalized..."});
            }
        }
        else {
            me.barcodeScanner.stop();
            dialogs.alert({title:"Error", message:"Sorry, we don't know item having this code\n"+result.text});
        }
        
    }
    



    
    scan() {
        if (this.curAct) {
            if (this.curAct.callbackScanButton) {
                this.curAct.callbackScanButton();
            }
            else {
                console.log("error : no action callback defined" );
            }
        }
    }

    chooseExterne() {
        let options = {
            title: "Extern",
            message: "Choose externe",
            cancelButtonText: "Cancel",
            actions: []
        };

        let externs = this.databaseService.query("externes");
        let cnt = 0;
        for (const xt of externs) {
            cnt = cnt + 1;
            options.actions.push(xt.code);
        }
        
        if (cnt > 1) {
            dialogs.action(options).then((result) => {
                if (result != "Cancel") {
                    this.curExt = result;
                }
            });
        }
        else {
            this.curExt = externs ? externs[0] : null;
        }
    }

    
    scanBulk(compo:MainComponent, fn:(mc:MainComponent,data:any)=>void)  {
        // SIMULATION
        // let options = {
        //     title: "barcode scanner simulation",
        //     message: "Choose code",
        //     cancelButtonText: "Cancel",
        //     actions: ["B0000000002", "B0000000003", "B0000000099", "B0000000098", "0101AG04", "0101AG05", "ZEASD"]
        // };
        
        // if (options) {
        //     dialogs.action(options).then((result) => {
        //         if (result != "Cancel") {
        //             let res:any = {};
        //             res.text = result;
        //             fn(compo,res)
        //             this.scanBulk(compo, fn);
        //         }
        //         else {
        //             let res:any = {};
        //             res.closing = true;
        //             fn(compo,res)
        //         }
        //     });
        //     return;
        // }



        console.log("start scanBulk")
        this.barcodeScanner.scan({
            formats: "QR_CODE, CODE_39, CODE_128",
            beepOnScan: true,
            // this callback will be invoked for every unique scan in realtime!
            continuousScanCallback: function (result) { fn(compo,result)},
            closeCallback: function () { console.log("Scanner closed"); }, // invoked when the scanner was closed
            reportDuplicates: false // which is the default
          }).then(
              function() {
                fn(compo,{closing: true});
                console.log("We're now reporting scan results in 'continuousScanCallback'");
              },
              function(error) {
                fn(compo,{closing: true, error:true});
                console.log("No scan: " + error);
              }
          );

    }



    
    scanInfo() {
        // SIMULATION
        // 
        // let options = {
        //     title: "Scan simuation",
        //     defaultText: "Enter scan result",
        //     input: true,
        //     okButtonText: "Ok",
        //     cancelButtonText: "Cancel"
        // };
        // if (options) {
        //     dialogs.prompt("Enter scan result", "B00000000").then((result) => {this.callBackInfo(this,result)}, (errorMessage) => {
        //         console.log("No scan. " + errorMessage);});
        //     return;
        // }


        console.log("start scan once");

        let scanConfig:any = {            
            formats: "QR_CODE, CODE_39,CODE_128",
            cancelLabel: "EXIT. Also, try the volume buttons!", // iOS only, default 'Close'
            cancelLabelBackgroundColor: "#333333", // iOS only, default '#000000' (black)
            message: "Use the volume buttons for extra light", // Android only, default is 'Place a barcode inside the viewfinder rectangle to scan it.'
            showFlipCameraButton: false,   // default false
            preferFrontCamera: false,     // default false
            showTorchButton: false,        // default false
            beepOnScan: true,             // Play or Suppress beep on scan (default true)
            torchOn: false,               // launch with the flashlight on (default false)
            //continuousScanCallback: callback,
            closeCallback: () => { console.log("Scanner closed")}, // invoked when the scanner was closed (success or abort)
            resultDisplayDuration: 500,   // Android only, default 1500 (ms), set to 0 to disable echoing the scanned text
            orientation: "orientation",     // Android only, default undefined (sensor-driven orientation), other options: portrait|landscape
            openSettingsIfPermissionWasPreviouslyDenied: true // On iOS you can send the user to the settings app if access was previously denied
          };

        this.barcodeScanner.scan(scanConfig).then((result) => {this.callBackInfo(this,result)}, (errorMessage) => {
            console.log("No scan. " + errorMessage);
          }
        );
  
    }
    
    goToLogin() {
        this.routerExtensions.navigate(["/login"], {
            clearHistory: true,
            transition: {
                name: "flip",
                duration: 2000,
                curve: "linear"
            }
        });

    }

    
    goToSynchro() {
        this.routerExtensions.navigate(["/sync"]);
    }

    // dblist() {
    //     console.log("dblist called");
    //     this.infos = [];
    //     let rows = this.databaseService.getDatabase().executeQuery("boxes");
    //     for(let i = 0; i < rows.length; i++) {
    //         this.infos.push(rows[i]);
    //     }
    // }

    chooseAction(code:string) {
        console.log("action changed : " + code);
        for (let index = 0; index < this.actions.length; index++) {
            const act = this.actions[index];
            if (act.code == code) {
                this.curAct = act;
                this.infos.splice(0, this.infos.length);
                this.showAction = false;
                this.refreshUI();
                if (code.startsWith("EXT")) {
                    this.chooseExterne();
                }
                return;
            }
        }
        this.showAction = false;
    }

    showDrawer() {
        this.showAction = !(this.showAction);
    }

    addScannedItem(text:string,cat:string) {
        this.scannedItems.splice(0,0,{code:text, type:cat});
    }

}