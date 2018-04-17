import { MainComponent } from "../main/main.component";
import { DatabaseService } from "../../providers/database.service";

// export interface ISynchroAction {
//     _title: string;
//     _label: string;
//     _inst: string;
// //    _callbackScanButton: (context:any) => {};
// }
// // {code:"PLACE", title:"Place", label:"lasts scans", inst:"Scan a position first, then as many item you want to locate into it. Then continue with next position", callbackScanButton : () => {this.scanBulk(this, this.callBackPlace);}},
           

export class SynchroAction {

    code: string;
    title: string;
    label: string;
    inst: string;
    mainComponent:MainComponent;
    
    constructor(mainComponent:MainComponent, title:string, label:string, inst:string) {
        this.mainComponent = mainComponent;
        this.code = "";
        this.title = title;
        this.label = label;
        this.inst = inst;
//        this._callbackScanButton = options._callbackScanButton;
    }

    initUI() {

    }
    
    callbackScanButton(me:SynchroAction) : void  {}

    addAction(details:any) {
        let actCode = this._addActionBuildUniqueCode(this.mainComponent, details);
        let dbService = this.mainComponent.getDatabaseService();
        let acc:any = dbService.getActionFromDB(actCode)|| {} ;
        if (!acc.type) {
            acc.type = "action";
            acc.synchro = "todo"; //todo,done,error
            acc.time = new Date().getTime();
            acc.item = details;
            acc.code = this.code;
    
        }
        else if (acc.synchro && (acc.synchro == "done") ) {
            //action is already done and synchronized
            //so : don't upadate...
            // don't call TWICE for the same action
            if (!this._acceptMultipleActionWithSameID()) {
                return;
            }
            // if ((mode == "LOAN_OUT") || (mode == "LOAN_IN")) {
            //     return;
            // }          
        }
        // from here we do the action
        acc.synchro = "todo"; //todo,done,error

        if (this.mainComponent.onlineMode) {
  
            this.mainComponent.callAPIpost(this.getOnlineUrl(details), this.getOnlineParam(details))
                .subscribe(
                    (response) => {
                        acc.synchro = "done";
                    },
                    (err) => {
                        acc.synchro = "error";
                    },
                    () => {
                        /* this function is executed when the observable ends (completes) its stream */
                        this.updateAction(dbService, acc);
                        this.updateUI(this.mainComponent,acc);
                    }
                );            
        }
        else {
            this.updateAction(dbService, acc);
            this.updateUI(this.mainComponent,acc);
        }




    }

    _addActionBuildUniqueCode(mainComponent:MainComponent, details:any) : string {
        return this.code;
    }
 

    _acceptMultipleActionWithSameID() {
        return true;
    }

    getOnlineUrl(details:any): string {
        return "/rest/archives/ping"
    }
    getOnlineParam(details:any): any {
        return {};
    }

    updateAction(dbservice:DatabaseService, acc:any) {
        dbservice.setDocument(this.code, acc);
    }

    updateUI(mainComponent:MainComponent, acc:any) {
       
    }

    getUIinitList() : any {
        return {};
    }

    useOnlineMode() : boolean {
        return true;
    }
}