import { MainComponent } from "../main/main.component";
import { SynchroAction }  from "./synchro-action";

export class SynchroActionExtConfirme extends SynchroAction {
    constructor(mainComponent:MainComponent, title:string, label:string, inst:string) {
        super(mainComponent, title, label, inst);
        this.code = "EXT_PROP";
    }

    callbackScanButton(me:SynchroActionExtConfirme) : void  {
        me.mainComponent.scanOnce(me, me.callBackInfo);
    }
    callBackInfo(me:SynchroActionExtConfirme, result:any) {

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

getUIinitList() {
           let externs = this.mainComponent.getDatabaseService().query("item-to-confirm-externalize");
            let ret:any = [];

            for (const xt of externs) {
                //UI update
                ret.splice(0,0,{code: xt.code , name: xt.code , value:xt.code})
                }
                return ret;
            }

}