import { MainComponent } from "../main/main.component";
import { SynchroAction }  from "./synchro-action";
import { DatabaseService } from "../../providers/database.service";


export class SynchroActionLoanOut extends SynchroAction {
    constructor(mainComponent:MainComponent, title:string, label:string, inst:string) {
        super(mainComponent, title, label, inst);
        this.code = "LOAN_OUT";
        this.indexName = "item-to-loan-out";
    }

    callbackScanButton(me:SynchroActionLoanOut) : void  {
        me.mainComponent.scanBulk(me, this.callBackScanBulk);
    }

    
    callBackScanBulk(me:SynchroActionLoanOut, result:any) : void {

        // on close called with result.closing:boolean = true;
        if (result.closing) {
            return;
        }

        // called after each scan
        let item:any = me.mainComponent.getDatabaseService().getItemFromDB(result.text);
        if (item) {
            if (me.canIUpdate(item)) {
                me.addAction({item:item.code}, item);
            }
            else {
                me.mainComponent.barcodeScannerStop();
                me.mainComponent.alert({title:"Error", message:"You cannot loan_out this"});
            }
        }
        else {
            me.mainComponent.barcodeScannerStop();
            me.mainComponent.alert({title:"Error", message:"Sorry, we don't know item having this code\n"+result.text});
        }



    }
 
    //get UID to store in local database
    _addActionBuildUniqueCode(mainComponent:MainComponent, details:any) : string {
        return this.code + "_ù_"+details.item;
    }
 
 
    getOnlineUrl(details:any, itemDB:any): string {
        let code:string = itemDB.code;
        let cur:string = itemDB.actions.LOAN_OUT.curStep;
        let nex:string = itemDB.actions.LOAN_OUT.nextStep;

        return "/rest/archives/loans/setState/"+code+"/"+cur+"/"+nex+"/"
    }

    getOnlineParam(details:any, itemDB:any): any {
        return {};
    }

    updateUI(mainComponent:MainComponent, acc:any) {
        mainComponent.addItemOnUI(acc.item.item, "lended (out)" ); 
    }

    _acceptMultipleActionWithSameID() {
        return false;
    }


}