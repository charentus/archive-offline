import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";

import { LoginComponent } from "./page/login/login.component";
import { MainComponent } from "./page/main/main.component";
import { SynchroComponent } from "./page/synchro/synchro.component";

export const routes: Routes = [
    { path: "", redirectTo: "/sync", pathMatch: "full" },
    { path: "login", component: LoginComponent },
    { path: "main", component: MainComponent },
    { path: "sync", component: SynchroComponent }
];

export const navigatableComponents = [
    LoginComponent,
    MainComponent,
    SynchroComponent
  ];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }