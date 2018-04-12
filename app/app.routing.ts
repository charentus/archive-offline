import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";

import { LoginComponent } from "./page/login/login.component";
import { MainComponent } from "./page/main/main.component";
import { SynchroComponent } from "./page/synchro/synchro.component";
import { ParamsComponent } from "./page/params/params.component";

export const routes: Routes = [
    { path: "", redirectTo: "/login", pathMatch: "full" },
    { path: "login", component: LoginComponent },
    { path: "main", component: MainComponent },
    { path: "sync", component: SynchroComponent },
    { path: "parameters", component: ParamsComponent }
];

export const navigatableComponents = [
    LoginComponent,
    MainComponent,
    SynchroComponent,
    ParamsComponent
  ];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }