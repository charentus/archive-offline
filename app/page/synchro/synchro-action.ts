import { MainComponent } from "../main/main.component";
import { DatabaseService } from "../../providers/database.service";

// export interface ISynchroAction {
//     _title: string;
//     _label: string;
//     _inst: string;
// //    _callbackScanButton: (context:any) => {};
// }
// // {code:"PLACE", title:"Place", label:"lasts scans", inst:"Scan a position first, then as many item you want to locate into it. Then continue with next position", callbackScanButton : () => {this.scanBulk(this, this.callBackPlace);}},
  

//code : code of action
//title : label on bottom screen, and inrelated  option list
//label : title on top of screen, just above actionBar
//inst : short instruction message just above the red scan button
//callbackScanButton : callBack when sacn button is pressed ( scanBulk is generic mass scan function, that need specific callBack related to action choosen)


export class SynchroAction {

    code: string;
    title: string;
    label: string;
    inst: string;
    mainComponent:MainComponent;
    indexName: string;
    
    constructor(mainComponent:MainComponent, title:string, label:string, inst:string) {
        this.mainComponent = mainComponent;
        this.code = "";
        this.title = title;
        this.label = label;
        this.inst = inst;
        this.indexName = null;
        
//        this._callbackScanButton = options._callbackScanButton;
    }

    initUI() {

    }
    
    callbackScanButton(me:SynchroAction) : void  {}

    addAction(details:any, itemDB:any) {
        //let itemDB:any = me.mainComponent.getDatabaseService().getItemFromDB("dddd");
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

        if (! this.canIUpdate(itemDB)) {
            return;
        }
        if (this.mainComponent.onlineMode) {
            this.synchronizeAction( details, itemDB);
        }
        else {
            this.updateAction(dbService, actCode, acc, itemDB);
            this.updateUI(this.mainComponent,acc);
        }

    }

    synchronizeAction(action:any, itemDB:any) {
        let details = action.details;
        this.mainComponent.callAPIpost(this.getOnlineUrl(details, itemDB), this.getOnlineParam(details, itemDB))
            .subscribe(
                (response) => {
                    action.synchro = "done";
                },
                (err) => {
                    action.synchro = "error";
                },
                () => {
                    /* this function is executed when the observable ends (completes) its stream */
                    this.updateAction(this.mainComponent.getDatabaseService(), action.code, action,itemDB);
                    this.updateUI(this.mainComponent,action);
                }
            );            
        
    }


    _addActionBuildUniqueCode(mainComponent:MainComponent, details:any) : string {
        return this.code;
    }
 

    _acceptMultipleActionWithSameID() {
        return true;
    }

    getOnlineUrl(details:any, itemDB:any): string {
        return "/rest/archives/loans/"
    }
    getOnlineParam(details:any, itemDB:any): any {
        return {};
    }

    
    updateAction(dbservice:DatabaseService, code:string, acc:any, itemDB:any) {
        // item is synchrnized( 'done' or 'error' => I.e. onlineMode)
        // update LOAN_OUT.done flag to prevent laters calls ( see canIUpdate(..) )
        if (acc.synchro != "todo") {
            //let item = this.mainComponent.getDatabaseService().getItemFromDB(acc.item);
            this.setActionToDone(itemDB);
            this.mainComponent.getDatabaseService().setDocument(acc.item.item, itemDB);
        }

        dbservice.setDocument(code, acc);
    }

    updateUI(mainComponent:MainComponent, acc:any) {
       
    }

    getUIinitList() : any[] {
        let ret:any[] = [];
        if (this.indexName) {
            let result:any[] =  this.mainComponent.getDatabaseService().query(this.indexName);
            for(const data of result) {
                ret.push({code: data.code , name: data.code , value:""});
            }
        }
        return ret;
    }

    useOnlineMode() : boolean {
        return true;
    }


    canIUpdate(item:any): boolean {
        if (item) {
            if (item.actions) {
                let t = item.actions[this.code];
                if (t) {
                    if (! t.done) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    setActionToDone(item:any) {
        if (item) {
            if (item.actions) {
                let t = item.actions[this.code];
                if (t) {
                    t.done  = new Date().getTime();
                }
            }
        }
    }

}