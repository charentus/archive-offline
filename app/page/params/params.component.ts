import { Component, OnInit, Inject, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "tns-core-modules/ui/page/page";
import { ActionBar } from "tns-core-modules/ui/action-bar/action-bar";
import * as dialogs from "ui/dialogs";
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
    selector: "ns-params",
   // providers: [EversuiteService],
    moduleId: module.id,
    templateUrl: "./params.component.html",
    styleUrls: ["./params-common.css"]
})

export class ParamsComponent implements OnInit {
// This pattern makes use of Angular’s dependency injection implementation to inject an instance of the infoservice service into this class. 
    // Angular knows about this service because it is included in your app’s main NgModule, defined in app.module.ts.
    constructor(private page: Page,
       private routerExtensions: RouterExtensions) {
    }

    useSound:boolean;
    onlineMode:boolean;


    ngOnInit(): void {
        this.useSound  = getBoolean("useSound", true);
        this.onlineMode  = getBoolean("onlineMode", false);
    }
    
    onUSChecked(event): void {
        setBoolean(  "useSound", event.value);
        this.useSound  = event.value;
    }

    onOMChecked(event): void {
        setBoolean(  "onlineMode", event.value);
        this.onlineMode  = event.value;
    }

    goToMain() {
        this.routerExtensions.navigate(["/main"], {
            transition: {
                name:  "slideRight",
                duration: 250,
                curve: "linear"
            } ,
            clearHistory: true
        });
    }

    getUSClass(): string {
        return this.useSound ? "SwitchChecked" : "";
    }
    getOMClass(): string {
        return this.onlineMode ? "SwitchChecked" : "";

    }
}    