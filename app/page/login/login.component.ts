import { Component, OnInit, Inject } from "@angular/core";
import { EversuiteService } from "../../shared/eversuite.service";
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
import { ConfigServer } from "../../shared/configserver";
import {DatabaseService } from "../../providers/database.service";
import { Couchbase } from "nativescript-couchbase";

import { BarcodeScanner } from 'nativescript-barcodescanner';
import Toolbox = require('nativescript-toolbox');
import { RouterExtensions } from "nativescript-angular/router";
import * as dialogs from "ui/dialogs";
import { LocalDatas } from "../../shared/local.data";

@Component({
    selector: "ns-items",
    providers: [EversuiteService],
    moduleId: module.id,
    templateUrl: "./login.component.html",
    styleUrls: ["./login-common.css", "./login.css"]
})

export class LoginComponent implements OnInit {
    // server config : url, user label...
    config: ConfigServer;
    // some flags used to activate UI parts
    showPair = false;
    showLogginEversuite = false;
    showLogginLocal = false;
    showList = false;
    showWait = true;

    //internal flag, log on process
    isLoggedLocally: boolean = false;
    isDBLoaded: boolean = false;
    startupStatus:number = 0;
    userPassword: string = "";

   // datas = [];


    // This pattern makes use of Angular’s dependency injection implementation to inject an instance of the ItemService service into this class. 
    // Angular knows about this service because it is included in your app’s main NgModule, defined in app.module.ts.
    constructor(private eversuiteService: EversuiteService, 
                private databaseService: DatabaseService, 
                private barcodeScanner: BarcodeScanner, 
                private routerExtensions: RouterExtensions) { }

    ngOnInit(): void {
        this.updateScreen();
    }

    //full reinit of locals datas
    reinit() {
        dialogs.confirm("This will erase all your application's datas").then(result => {
            console.log("Dialog result: " + result);
            if (result) {
                this.databaseService.clearDB();
                this.updateScreen();
            }
        });
    }

    //hiding/showing UI parts according login process
    updateScreen(): void {
        this.showPair = false;
        this.showLogginEversuite = false;
        this.showLogginLocal = false;
        this.showWait = false;
        this.showList = false; 
        this.databaseService.getDatabase();
        let conf:any = this.databaseService.getServerConfig();

        if (conf == undefined) {
            this.showPair = true;
            console.log("login screen #1");
        }
        else { 
            try {
                this.config = new ConfigServer( conf);
                if (! this.config.isLogged()) {
                    this.showLogginEversuite = true;
                    console.log("login screen #2");
                }
                else {
                    if (this.isLoggedLocally == false) {
                        this.showLogginLocal = true;
                        console.log("login screen #3");
                    }
                    else { 
                        if (this.databaseService.hasDatas() == false) {
                            this.showWait = true;
                            console.log("login screen #4");
                        }
                        else {
                            this.showList = true;
                            console.log("login screen #5");
                            this.routerExtensions.navigate(["/main"], {
                                clearHistory: true,
                                // transition: {
                                //     name: "flip",
                                //     duration: 2000,
                                //     curve: "linear"
                                // }
                            });

                        }
                    }
                }
            }
            catch(e) {
                this.showPair = true;
            }
        }

    }

    //filling local DB with synch result
    onSynchDBsucces(res : Response | any) {
        const body = res.json() || "";
        let ni : number = 0;
        let ns : number = 0;
        let ne : number = 0;
        let nl : number = 0;
        if (body.items) {
            ni = this.databaseService.fillWithItems(body.items)
        }
        if (body.positions) {
            ns = this.databaseService.fillWithPositions(body.positions)
        }
        if (body.externes) {
            ne = this.databaseService.fillWithExternes(body.externes)
        }
        if (body.summary) {
            this.databaseService.setDBinfo(body.summary);
        }
        this.isDBLoaded = true;
        this.updateScreen();
    }
    
    // online connexion, then synch datas from server
    doLogginEversuite() : void {

        this.eversuiteService.loginEversuite(this.config, this.userPassword).subscribe(
            (result) => {
                console.log("###" + result.headers.get("X-CSRF-Token"));
                let encodedPassword = Toolbox.sha1(this.userPassword);
                let token = result.headers.get("X-CSRF-Token");
                this.config.userLogged(encodedPassword, token)
                this.databaseService.setServerConfig(this.config.toDatas());
                //not necessary to re_log locally
                this.isLoggedLocally = true;
                LocalDatas.setString("transcientCred", this.userPassword);
                this.updateScreen();


                this.eversuiteService.synchEversuite(this.config).subscribe((result) => {
                    this.onSynchDBsucces(result);
                }, (error) => {
                    //console.dir(error);
                });
                
             

            },
            (error) => alert("Bad Password.")
          );
    }

    // offLine connexion, using local encoded password 
    doLogginLocal() : void  {
        let encodedPassword = Toolbox.sha1(this.userPassword);

        if (encodedPassword == this.config.hashPassword()) {
            this.isLoggedLocally = true;
            LocalDatas.setString("transcientCred", this.userPassword);
        }
        else {
            alert("bad password");
        }

        this.updateScreen();

    }

    
    

    scanConfig(): void {

        //SIMULATION
        let ccf:any = {
            apiUrl : "https://d-charentus.everteam.com:8443/es",
            userLabel: "Administrator EverSuite",
            userCode: "admin",
            storageKey : 1
        };
        if (ccf != undefined) {
            this.databaseService.setServerConfig(ccf);
            this.updateScreen();
            return;
        }


        let options:any = {
            formats: "QR_CODE, EAN_13",
            cancelLabel: "EXIT. Also, try the volume buttons!", // iOS only, default 'Close'
            cancelLabelBackgroundColor: "#333333", // iOS only, default '#000000' (black)
            message: "Use the volume buttons for extra light", // Android only, default is 'Place a barcode inside the viewfinder rectangle to scan it.'
            showFlipCameraButton: true,   // default false
            preferFrontCamera: false,     // default false
            showTorchButton: true,        // default false
            beepOnScan: true,             // Play or Suppress beep on scan (default true)
            torchOn: false,               // launch with the flashlight on (default false)
            closeCallback: () => {  console.log("Scanner closed")}, // invoked when the scanner was closed (success or abort)
            resultDisplayDuration: 500,   // Android only, default 1500 (ms), set to 0 to disable echoing the scanned text
            orientation: "portrait", //orientation,     // Android only, default undefined (sensor-driven orientation), other options: portrait|landscape
            openSettingsIfPermissionWasPreviouslyDenied: true // On iOS you can send the user to the settings app if access was previously denied
          };

        this.barcodeScanner.scan(options).then((result) => {
                let ccf:any = JSON.parse(result.text);
                if (ccf != undefined) {
                    this.databaseService.setServerConfig(ccf);
                    this.updateScreen();
                }
            }
              , (errorMessage) => {
                console.log("No scan. " + errorMessage);
            }
        );
    }
}