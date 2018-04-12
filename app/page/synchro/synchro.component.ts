import { Component, OnInit, Inject, ViewChild, ElementRef } from "@angular/core";
import {DatabaseService } from "../../providers/database.service";
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "tns-core-modules/ui/page/page";
import { Image } from "ui/image";
import { FlexboxLayout } from "ui/layouts/flexbox-layout";
import { ActionBar } from "tns-core-modules/ui/action-bar/action-bar";
import * as dialogs from "ui/dialogs";

@Component({
    selector: "ns-synchro",
   // providers: [EversuiteService],
    moduleId: module.id,
    templateUrl: "./synchro.component.html",
    styleUrls: ["./synchro-common.css"]
})


export class SynchroComponent implements OnInit {
// This pattern makes use of Angular’s dependency injection implementation to inject an instance of the infoservice service into this class. 
    // Angular knows about this service because it is included in your app’s main NgModule, defined in app.module.ts.
    constructor(private page: Page,
        //private eversuiteService: EversuiteService, 
        private databaseService: DatabaseService, 
        private routerExtensions: RouterExtensions) {

    }

    actions:any[] = [];
    ngOnInit(): void {

        let d1:number = new Date().getTime();
        this.actions = this.databaseService.query("actions");
        let d2:number = new Date().getTime();
        dialogs.alert("loading time : " + ((d2-d1)/1000));
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
}

