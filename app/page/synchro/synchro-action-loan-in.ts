import { MainComponent } from "../main/main.component";
import { SynchroAction }  from "./synchro-action";
import { DatabaseService } from "../../providers/database.service";


export class SynchroActionLoanIn extends SynchroAction {
    constructor(mainComponent:MainComponent, title:string, label:string, inst:string) {
        super(mainComponent, title, label, inst);
        this.code = "LOAN_IN";
        this.indexName = "item-to-loan-in";
    }

    callbackScanButton(me:SynchroActionLoanIn) : void  {
        me.mainComponent.scanBulk(me, this.callBackScanBulk);
    }

    
    callBackScanBulk(me:SynchroActionLoanIn, result:any) : void {

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
                me.mainComponent.alert({title:"Error", message:"You cannot loan_in this"});
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
        let cur:string = itemDB.actions.LOAN_IN.curStep;
        let nex:string = itemDB.actions.LOAN_IN.nextStep;

        return "/rest/archives/loans/setState/"+code+"/"+cur+"/"+nex+"/"
    }

    getOnlineParam(details:any, itemDB:any): any {
        return {};
    }


    updateUI(mainComponent:MainComponent, acc:any) {
        mainComponent.addItemOnUI(acc.item.item, "lended (in)" ); 
    }

    _acceptMultipleActionWithSameID() {
        return false;
    }

}