import { Component, OnInit, Inject, ViewChild, ElementRef } from "@angular/core";
import {
    getBoolean,
    setBoolean,
    getNumber,
    setNumber,
    getString,
    setString,
    hasKey,
    remove, 
    clear
} from "application-settings";
import {DatabaseService } from "../../providers/database.service";
import { EversuiteService } from "../../shared/eversuite.service";
import { BarcodeScanner } from 'nativescript-barcodescanner';
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "tns-core-modules/ui/page/page";
import { Image } from "ui/image";
import { FlexboxLayout } from "ui/layouts/flexbox-layout";
import { ActionBar } from "tns-core-modules/ui/action-bar/action-bar";
import * as dialogs from "ui/dialogs";
import { LoginResult} from "ui/dialogs"
import { ConfigServer} from "../../shared/configserver"
import { SynchroAction } from "../synchro/synchro-action";
import { SynchroActionPlace } from "../synchro/synchro-action-place";
import { SynchroActionInfo } from "../synchro/synchro-action-info";
import { SynchroActionExtConfirme } from "../synchro/synchro-action-ext-conf";
import { SynchroActionLoanOut } from "../synchro/synchro-action-loan-out";
import { SynchroActionLoanIn } from "../synchro/synchro-action-loan-in";
import { LocalDatas } from "../../shared/local.data";


@Component({
    selector: "ns-infos",
   // providers: [EversuiteService],
    moduleId: module.id,
    templateUrl: "./main.component.html",
    styleUrls: ["./main-common.css", "./main.css"]
})


export class MainComponent implements OnInit {

   //user Preferences
   useSound:boolean;
   onlineMode:boolean;

    public actions:any;
    //UI
    public currentAction: string;
    public instructions: string;
    public titleList:string = "";
    public showAction:boolean = false;


    //temporary variables
    //used for place and recol
    public curPosition:string = "";
    public curItems:string[] = [];
    // used for externalize
    public curExt:string;


    public curAct : SynchroAction;

    public desc: string;
    infos:any = [];

    sep:string="-ù-";

    public configServer:ConfigServer = new ConfigServer( this.databaseService.getServerConfig());
    //scannedItems:scanItem[] =  [];




    // This pattern makes use of Angular’s dependency injection implementation to inject an instance of the infoservice service into this class. 
    // Angular knows about this service because it is included in your app’s main NgModule, defined in app.module.ts.
    constructor(private page: Page,
                private eversuiteService: EversuiteService, 
                private databaseService: DatabaseService, 
                private barcodeScanner: BarcodeScanner, 
                private routerExtensions: RouterExtensions) {

                 // registerElement("BarcodeScanner", () => require("nativescript-barcodescanner").BarcodeScannerView);

                }

    ngOnInit(): void {
        this.showAction = false;





        this.actions = [];
        let infos:any = this.databaseService.getDBinfo() || {};
        if (infos.nbActs) {
            if (infos.nbActs.PLACE) {
                this.actions.push( new SynchroActionPlace(this, "Place",  "lasts scans", "Scan a position first, then as many item you want to locate into it. Then continue with next position"));
            }
            if (infos.nbActs.EXT_CONF) {
                this.actions.push( new SynchroActionExtConfirme(this, "Externalize (confirm)","Items to scan : ", "Scan items you want to confirm externalize"));
            }
            if (infos.nbActs.LOAN_OUT) {
                this.actions.push( new SynchroActionLoanOut(this, "Loan (out)","Items to scan : ", "Scan items to be lend (i.e. going out of storage)"));
            }
            if (infos.nbActs.LOAN_IN) {
                this.actions.push( new SynchroActionLoanIn(this, "Loan (in)","Items to scan : ", "Scan returned  items  (i.e. returning to storage)"));
            }
        }
        if ((infos.nbItems && (infos.nbItems > 0)) || (infos.nbPositions &&(infos.nbPositions > 0))) {
            this.actions.push( new SynchroActionInfo(this, "Informations","Informations on item or position", "Scan barcode to get details"));
        }



       /*
            // {code:"RECOL", title:"Recolement", label:"lasts scans", inst:"Scan a position first, then all items in this position. Then continue with next position", callbackScanButton : () => {this.scanBulk(this, this.callBackRecol);}},
            {code:"DESTRUC", title:"Destruction", label:"Items to scan : ", inst:"Scan items you remove from storage to destruct"},
            {code:"EXT_PRO", title:"Externalize (proposition)", label:"Externalize proposal", inst:"Scan items you propose to externalize", callbackScanButton : () => {this.scanBulk(this, this.callBackExtePropose);}},
            {code:"EXT_CONF", title:"Externalize (confirm)", label:"Items to scan : ", inst:"Scan items you want to confirm externalize", callbackScanButton : () => {this.scanBulk(this, this.callBackExteConfirm);}} 
        */
        
        this.curAct = this.actions[0];
        this.curPosition = null;

        this.useSound  = getBoolean("useSound", true);
        this.onlineMode  = getBoolean("onlineMode", false);

        this.refreshUI();

    }

    getDatabaseService() {
        return this.databaseService;
    }
    getEversuiteService() {
        return this.eversuiteService;
    }

    barcodeScannerStop() {
        this.barcodeScanner.stop();
    }

    alert(message : any): Promise<void> {
        return dialogs.alert(message);
    }

    callAPIpost(restURL:string, parameters?:any , encode?:boolean)  {
        return this.eversuiteService.callAPIpost(this.configServer, restURL, parameters, encode) 
    }

    addItemOnUI(name:string, value:string) {
        this.infos.splice(0,0,{name: name , value:value});
    }
    clearItemsOnUI() {
        this.infos.splice(0,this.infos.length);
    }

    setOnlineMode(bo:boolean) {
        setBoolean("onlineMode", bo);
        this.onlineMode = bo;
    }

    //on action selected change
    //some actions need to fill screen list  'infos'
    refreshUI(act?:number) {
        if (act != null) {
            this.curAct = this.actions[act];
        }
        this.currentAction = this.curAct.title;
        this.instructions = this.curAct.inst;
        this.titleList = this.curAct.label;
        let initdatas = this.curAct.getUIinitList();
        this.infos.splice(0,this.infos.length);
        if (initdatas) {
            for (const data of initdatas) {
                //UI update
                this.infos.splice(0,0,{code: data.code , name: data.name , value:data.value});
//                cnt = cnt + 1;
            }
        }
        // if (this.curAct.code == "EXT_CONF") {
        //     let externs = this.databaseService.query("item-to-confirm-externalize");
        //     let cnt = 0;
        //     for (const xt of externs) {
        //         //UI update
        //         this.infos.splice(0,0,{code: xt.code , name: xt.code , value:""});
        //         cnt = cnt + 1;
        //     }
    
        // }
        // if (this.curAct.code == "DESTRUC") {
        //     let items = this.databaseService.query("item-to-destruct");
        //     let cnt = 0;
        //     for (const it of items) {
        //         //UI update
        //         this.infos.splice(0,0,{code: it.code , name: it.code , value:""});
        //         cnt = cnt + 1;
        //     }
    
        // }
        
        
        // }
       
    }

    

    //utility , called by callback to store action to synchronise into local DB
    // or if 'onlineMode' is set : try to synchronise with server then store it locally on fail..
    // addAction(mode:string, action_code:string, details:any) {
    //     let acc:any = this.databaseService.getActionFromDB(action_code) || {};
    //     if (acc.synchro && (acc.synchro == "done") ) {
    //         //action is already done and synchronized
    //         //so : don't upadate...
    //         // don't call TWICE for the same action
    //         if ((mode == "LOAN_OUT") || (mode == "LOAN_IN")) {
    //             return;
    //         }          
    //     }

    //    

    //    

    //     // }
    //     // if (mode == "RECOL") {
    //     //     //addAction("RECOL", {position:me.curPosition,items:[code...]});
    //     //     acc = this.updateAction(doc_code, code, details);

    //     //     this.databaseService.setDocument(doc_code, acc);
    //     //     //UI update
    //     //     let det = "contains : ";
    //     //     for(let c of details.items) {
    //     //         det += "\n   - "+ c;
    //     //     }
    //     //     this.infos.splice(0,0,{name: acc.position , value:det});
    //     // }
    //     /
    //     // if ((code == "EXT_PRO")||(code == "EXT_CONF")) {
    //     //     let doc_code = code+"_ù_"+details.item;
    //     //     //addAction("EXT_PRO", {externe:me.curExt,item:item.code});
    //     //     acc = this.updateAction(doc_code, code, details);

    //     //     this.databaseService.setDocument(doc_code, acc);

    //     //     //UI update
    //     //     if ((code == "EXT_PRO")||(code == "EXT_CONF")) {
    //     //         let det = "externe proposed ("+ acc.externe+")";
    //     //         if (code == "EXT_CONF") {
    //     //             det = "externe confirmed ("+ acc.externe+")";
    //     //         }
    //     //         this.infos.splice(0,0,{name: acc.item , value:det});
    //     //     }
    //     //     if (code == "EXT_CONF") {
    //     //         //UI update
    //     //         this.removeInfosRow(acc.item.code);
    //     //     }
    //     // }

    // }

    //UI utility : remove row on screen when action on it is done.
    removeInfosRow(code:string) {
        for( let pos = 0; pos < this.infos.length; pos++) {
            let itemrow = this.infos[pos];
            if (code == itemrow.code) {
                this.infos.splice(pos,1);
            }
        }

    }


//CALLBACKS




    //Red button pressed 
    scan() {
        if (this.curAct) {
            if (this.curAct.callbackScanButton) {
                if (this.onlineMode && this.curAct.useOnlineMode()) {
                    // check if connected
                    this.eversuiteService.callAPIget(this.configServer, "/rest/archives/ping").subscribe(
                        (response) => {
                            //connection is ok, do normalcallbak
                            this.curAct.callbackScanButton(this.curAct);
                        },
                        (err) => {
                            //DEBUG
                               /* this function is executed when there's an ERROR */
                               if (err.status == 403) {
                                   /* 403 error : need reconnexion */
                                   let usp:string = LocalDatas.getString("transcientCred", "");
                                   if (usp.length > 0) {
                                    this.eversuiteService.loginEversuite(this.configServer, usp).subscribe((result) => {
                                        /* logged ok */
                                        //connection is ok, do normalcallbak
                                        this.curAct.callbackScanButton(this.curAct);
                                    }, (error) => {
                                        //login failed
                                        //abort : do Nothing
                                        dialogs.alert("Cannot reach server, deselect online mode !");
                                    });
                                    return;
                                   }
                                   else {
                                    let options = {
                                        title: "Online Mode",
                                        message: "You have to log in",
                                        username: this.configServer.getUsercode(),
                                        password: "",
                                        okButtonText: "Ok",
                                        cancelButtonText: "Cancel"
                                    };
                                    dialogs.login(options).then((loginResult: LoginResult) => {
                                        if (loginResult.result) {
                                            this.eversuiteService.loginEversuite(this.configServer, loginResult.password).subscribe((result) => {
                                                    /* logged ok */
                                                    //connection is ok, do normalcallbak
                                                    this.curAct.callbackScanButton(this.curAct);
                                                }, (error) => {
                                                    //login failed
                                                    //abort : do Nothing
                                                    //this.setOnlineMode(  false);
                                                    dialogs.alert("Cannot reach server, deselect online mode !");
                                                });
                                        }
                                    });
                                   }

                                }
                                else {
                                   /* other error , assuming server is unreachable...
                                   so abort */
                                   //this.setOnlineMode(  false);
                                   dialogs.alert("Cannot reach server, you should stop online mode !");

                                }
                        },
                        () => {
                               /* this function is executed when the observable ends (completes) its stream */
                               console.log("COMPLETED");
                        }
                    );
                }
                else {
                    // offline mode
                    // do normal callback
                    this.curAct.callbackScanButton(this.curAct);
                }
            }
            else {
                //
                dialogs.alert("error : no action callback defined" );
            }
        }
    }

    chooseExternDialog() {
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

    
    scanBulk(sync_act:SynchroAction, /*compo:MainComponent,*/ fn:(sync_act:SynchroAction,/*mc:MainComponent,*/data:any)=>void)  {
        //SIMULATION
        let options = {
            title: "barcode scanner simulation",
            message: "Choose code",
            cancelButtonText: "Cancel",
            actions: ["B0000000002", "B0000000003", "B0000000006","B0000000099", "B0000000098", "0101AG04", "0101AG05", "ZEASD"]
        };
        
        if (options) {
            dialogs.action(options).then((result) => {
                if (result != "Cancel") {
                    let res:any = {};
                    res.text = result;
                    //fn(compo,res)
                    fn(sync_act,res)
                    this.scanBulk(sync_act, fn);
                }
                else {
                    let res:any = {};
                    res.closing = true;
                    fn(sync_act,res)
                }
            });
            return;
        }

        this.barcodeScanner.scan({
            formats: "QR_CODE, CODE_39, CODE_128",
            beepOnScan: true,
            // this callback will be invoked for every unique scan in realtime!
            continuousScanCallback: function (result) { fn(sync_act,result)},
            closeCallback: function () { console.log("Scanner closed"); }, // invoked when the scanner was closed
            reportDuplicates: false // which is the default
          }).then(
              function() {
                fn(sync_act,{closing: true});
                console.log("We're now reporting scan results in 'continuousScanCallback'");
              },
              function(error) {
                fn(sync_act,{closing: true, error:true});
                console.log("No scan: " + error);
              }
          );

    }



    
    scanOnce(sync_act:SynchroAction, /*compo:MainComponent,*/ fn:(sync_act:SynchroAction,/*mc:MainComponent,*/data:any)=>void) {
        //SIMULATION
        let options = {
            title: "Scan simuation",
            defaultText: "Enter scan result",
            input: true,
            okButtonText: "Ok",
            cancelButtonText: "Cancel"
        };
        if (options) {
            dialogs.prompt("Enter scan result", "B00000000").then((result) => {fn(sync_act,result)}, (errorMessage) => {
                console.log("No scan. " + errorMessage);});
            return;
        }


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

        this.barcodeScanner.scan(scanConfig).then((result) => {fn(sync_act,result)}, (errorMessage) => {
            console.log("No scan. " + errorMessage);
          }
        );
  
    }
    


    //navigation


    goToLogin() {
        this.routerExtensions.navigate(["/login"], {
            clearHistory: true/*,
            transition: {
                name: "flip",
                duration: 2000,
                curve: "linear"
            }*/
        });

    }

    
    goToSynchro() {
        this.routerExtensions.navigate(["/sync"],  {
            transition: {
                name:  "slideRight",
                duration: 250,
                curve: "linear"
            }
        });
    }
    goToParameters() {
        this.routerExtensions.navigate(["/parameters"], {
            transition: {
                name:  "slideLeft",
                duration: 250,
                curve: "linear"
            }
        });
    }

    // change currentAction

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
                    this.chooseExternDialog();
                }
                return;
            }
        }
        this.showAction = false;
    }

    // show action list
    showDrawer() {
        this.showAction = !(this.showAction);
    }


}