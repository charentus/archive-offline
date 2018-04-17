import { Component, OnInit, Inject, ViewChild, ElementRef } from "@angular/core";
import {DatabaseService } from "../../providers/database.service";
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "tns-core-modules/ui/page/page";
import { Image } from "ui/image";
import { FlexboxLayout } from "ui/layouts/flexbox-layout";
import { ActionBar } from "tns-core-modules/ui/action-bar/action-bar";
import * as dialogs from "ui/dialogs";
import { EversuiteService } from "../../shared/eversuite.service";
import { ConfigServer } from "../../shared/configserver";
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

@Component({
    //selector: "ns-synchro",
    //providers: [EversuiteService],
    moduleId: module.id,
    templateUrl: "./synchro.component.html",
    styleUrls: ["./synchro-common.css"]
})


export class SynchroComponent implements OnInit {
    serverConf:ConfigServer;
    actions:any[] = [];
    onlineMode:boolean;

// This pattern makes use of Angular’s dependency injection implementation to inject an instance of the infoservice service into this class. 
    // Angular knows about this service because it is included in your app’s main NgModule, defined in app.module.ts.
    constructor(private page: Page,
        private eversuiteService: EversuiteService, 
        private databaseService: DatabaseService, 
        private routerExtensions: RouterExtensions) {

    }

    ngOnInit(): void {
        this.serverConf = new ConfigServer(this.databaseService.getServerConfig());
        //fill UI
        this.actions = this.databaseService.query("actions");
        this.onlineMode  = getBoolean("onlineMode", false);
    }


    //UI synchro all
    synchroAll() {
        this.eversuiteService.callAPIpost(this.serverConf, "/rest/archives/synch", {}).subscribe((result) => {
            console.log("ress "+result);
        }, (error) => {
            console.log("errr  "+error);
        });
    }





 

    goToMain() {
        this.routerExtensions.navigate(["/main"], {
            clearHistory: true
        });
    }
    
    goBack() {
        this.routerExtensions.backToPreviousPage();
    }

    getSynchroStatus(item:any) {
        let notSynchronized:string = "&#xF017;";
        let okSynchronized:string = "&#xF00C;";
        let errorSynchronized:string = "&#xF00D;";
        //item.synchro = "todo"; //todo,done,error

        //console.dir(item);
        if (item.syncro == "done") {
            return okSynchronized
        }
        if (item.syncro == "error") {
            return errorSynchronized
        }

        return notSynchronized;
    }




    onOMChecked(event): void {
        setBoolean(  "onlineMode", event.value);
        this.onlineMode  = event.value;
    }

    getOMClass(): string {
        return this.onlineMode ? "SwitchChecked" : "";

    }
}

