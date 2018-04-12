import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptHttpModule } from "nativescript-angular/http";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { AppRoutingModule } from "./app.routing";
import { AppComponent } from "./app.component";
import { routes, navigatableComponents } from "./app.routing";


import { EversuiteService } from "./shared/eversuite.service";
import { LoginComponent } from "./page/login/login.component";

import { Http, HttpModule } from '@angular/http';

import { DatabaseService } from "./providers/database.service";

import { BarcodeScanner } from "nativescript-barcodescanner";

// Uncomment and add to NgModule imports if you need to use two-way binding
// import { NativeScriptFormsModule } from "nativescript-angular/forms";

// Uncomment and add to NgModule imports  if you need to use the HTTP wrapper
// import { NativeScriptHttpModule } from "nativescript-angular/http";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptHttpModule,
        NativeScriptModule,
        NativeScriptFormsModule,
        AppRoutingModule
    ],
    declarations: [
        AppComponent,
        ...navigatableComponents
    ],
    providers: [
        EversuiteService,
        DatabaseService,
        { provide: BarcodeScanner, useFactory: (createBarcodeScanner) }
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
/*
Pass your application module to the bootstrapModule function located in main.ts to start your app
*/
export class AppModule { }


export function createBarcodeScanner() {
  return new BarcodeScanner();
}

