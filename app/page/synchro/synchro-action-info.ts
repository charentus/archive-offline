import { MainComponent } from "../main/main.component";
import { SynchroAction }  from "./synchro-action";

export class SynchroActionInfo extends SynchroAction {
    constructor(mainComponent:MainComponent, title:string, label:string, inst:string) {
        super(mainComponent, title, label, inst);
        this.code = "INFO";
    }

    callbackScanButton(me:SynchroActionInfo) : void  {
        me.mainComponent.scanOnce(me, me.callBackInfo);
    }
    callBackInfo(me:SynchroActionInfo, result:any) {

    let informations:any = me.mainComponent.getDatabaseService().getInfosfromDB(result.text, true);
    if (informations) {
        me.mainComponent.clearItemsOnUI();
        //fill screen with result
        for(let info of informations) {
            me.mainComponent.addItemOnUI(info.name, info.value);
        }
    }
    else {
        //show error message
        me.mainComponent.alert({title:"Error", message:"Sorry, we haven't any information on for this code\n"+result.text});
    }
}

useOnlineMode() : boolean {
    return true;
}


}