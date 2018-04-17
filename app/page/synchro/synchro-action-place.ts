import { MainComponent } from "../main/main.component";
import { SynchroAction }  from "./synchro-action";

export class SynchroActionPlace extends SynchroAction {
    public curPosition:string;

    constructor(mainComponent:MainComponent, title:string, label:string, inst:string) {
        super(mainComponent, title, label, inst);
        this.curPosition = null;
        this.code = "PLACE"
    }

    callbackScanButton(me:SynchroAction) : void  {
        me.mainComponent.scanBulk(me, this.callBackScanBulk);
    }

    setCurPosition(pos:string) {
        this.curPosition = pos;
    }

    getCurPosition() {
        return this.curPosition;
    }
    
    callBackScanBulk(me:SynchroActionPlace, result:any) : void {

        // on close called with result.closing:boolean = true;
        if (result.closing) {
            return;
        }

        // called after each scan
        let position:any = me.mainComponent.getDatabaseService().getPositionFromDB(result.text);
        if (position) {
            me.setCurPosition( position.code);
        }
        else {
            let item:any = me.mainComponent.getDatabaseService().getItemFromDB(result.text);
            if (item) {
                if (me.getCurPosition() == null) {
                    me.mainComponent.barcodeScannerStop();
                    me.mainComponent.alert({title:"Error", message:"You, should scan a position first"});
                }
                else {
                    me.addAction({position:me.getCurPosition() ,item:item.code});
                }
            }
            else {
                me.mainComponent.barcodeScannerStop();
                me.mainComponent.alert({title:"Error", message:"Sorry, we don't know item having this code\n"+result.text});
            }


        }


    }
 
    //get UID to store in local database
    _addActionBuildUniqueCode(mainComponent:MainComponent, details:any) : string {
        return this.code + "_ù_"+details.item;
    }
 
 
    getOnlineUrl(details:any): string {
        return "/rest/archives/storages/"+details.position
    }

    getOnlineParam(details:any): any {
        return {
            "type": {
              "kind": "BOITE",
              "state": "ALIVE"
            },
            "ids": [
                details.item
            ]
        };
    }

    updateUI(mainComponent:MainComponent, acc:any) {
        mainComponent.addItemOnUI(acc.item.item, "placed on " + acc.item.position); 
    }

}