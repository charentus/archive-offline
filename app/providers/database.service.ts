import { Injectable, EventEmitter } from "@angular/core";
import { Couchbase } from "nativescript-couchbase";

@Injectable()
export class DatabaseService {

    private  database: Couchbase = null;
    private pushReplicator: any;
    private pullReplicator: any;
    private listener: EventEmitter<any> = new EventEmitter();
    private hasData : boolean;

    constructor() {}
    
    init() {
        this.database = new Couchbase("archive-db");
        this.hasData = false;
        this.database.createView("boxes", "1", function(document, emitter) {
            if(document.type == "box") {
                emitter.emit(document._id, document);
            }
        });
        this.database.createView("item-to-confirm-externalize", "1", function(document, emitter) {
            if((document.type == "box") && (document.externeEtat == 5)) {
                emitter.emit(document._id, document);
            }
        });
        this.database.createView("positions", "1", function(document, emitter) {
            if(document.type == "position") {
                emitter.emit(document._id, document);
            }
        });
        this.database.createView("externes", "1", function(document, emitter) {
            if(document.type == "externe") {
                emitter.emit(document._id, document);
            }
        });
        this.database.createView("actions", "1", function(document, emitter) {
            if(document.type == "action") {
                emitter.emit(document._id, document);
            }
        });
        this.database.createView("configuration", "1", function(document, emitter) {
            if(document.type == "configuration") {
                emitter.emit(document._id, document);
            }
        });
    }

    clearDB() {
        let db = this.getDatabase();
        db.destroyDatabase();
        this.database = null;
        this.init();
    }

    public query(viewName: string): Array<any> {
        return this.getDatabase().executeQuery(viewName);
    }

    public startReplication(gateway: string, bucket: string) {
        // this.pushReplicator = this.database.createPushReplication("http://" + gateway + ":4984/" + bucket);
        // this.pullReplicator = this.database.createPullReplication("http://" + gateway + ":4984/" + bucket);
        // this.pushReplicator.setContinuous(true);
        // this.pullReplicator.setContinuous(true);
        // this.database.addDatabaseChangeListener(changes => {
        //     this.listener.emit(changes);
        // });
        // this.pushReplicator.start();
        // this.pullReplicator.start();
    }

    getDatabase() : Couchbase {
        if (this.database == null) {
            this.init();
        }
        return this.database;
    }

    getChangeListener() {
        return this.listener;
    }
    
    getServerConfig(): any {
        return this.getDatabase().getDocument("_Config_Server_");
    }

    setServerConfig(conf : any): void {
        //setting server config clear all database
        //this.clearDB();
        try {
            this.getDatabase().deleteDocument("_Config_Server_")
            this.getDatabase().createDocument( conf, "_Config_Server_");
        }
        catch(e) {
            this.getDatabase().updateDocument( "_Config_Server_", conf);
        }
    }

    setDocument(key:string,conf : any): void {
        //setting server config clear all database
        //this.clearDB();
        try {
            this.getDatabase().deleteDocument(key)
            this.getDatabase().createDocument( conf, key);
        }
        catch(e) {
            this.getDatabase().updateDocument( key, conf);
        }
    }
    getDBinfo(): any {
        return this.getDatabase().getDocument("_Infos_Database_");
    }

    setDBinfo(conf : any): void {
        try {
            this.getDatabase().deleteDocument("_Infos_Database_")
            this.getDatabase().createDocument( conf, "_Infos_Database_");
        }
        catch(e) {
            this.getDatabase().updateDocument( "_Infos_Database_", conf);
        }
    }

    fillWithItems(items : any[] ) {
        let i : number = 0;
        for (let data of items) {
            i = i+ 1;
            data.type = "box";

//DEBUG TO BE REMOVED
//DEBUG TO BE REMOVED
//DEBUG TO BE REMOVED
if ((i%7)==0) {
    data.externeEtat = 5;
}
//DEBUG TO BE REMOVED
//DEBUG TO BE REMOVED
//DEBUG TO BE REMOVED



            this.database.createDocument(data, data.code);
            this.hasData = true;
            if ((i%50)==0) {
                console.log(" loaded item #"+i);
            }
        }
        return i;
    }
    fillWithPositions(items : any[] ) {
        let i : number = 0;
        for (let data of items) {
            i = i+ 1;
            data.type = "position";
            this.database.createDocument(data, data.code);
            if ((i%50)==0) {
                console.log(" loaded position #"+i);
            }
            this.hasData = true;
        }
        return i;
    }

    fillWithExternes(items : any[] ) {
        let i : number = 0;
        for (let data of items) {
            i = i+ 1;
            data.type = "externe";
            this.database.createDocument(data, data.code);
            console.log(" loaded Externe #"+i);
            this.hasData = true;
        }
        return i;
    }

    hasDatas() : boolean {
        return this.getDBinfo() ? this.getDBinfo().hasData : false;
    }

    getPosition(ref:string) {
        let ret:any;

        ret = this.getDatabase().getDocument(ref);

        if (ret == null) {
            let ref2 = ref.substring(0, ref.length - 1);
            ret = this.getDatabase().getDocument(ref2);
        }

        return ret;
    }

    getPositionFromDB(ref:string, format?:boolean) {
        return this.getInfosfromDB(ref, format, (res) => {return res.type == "position"});
    }

    getActionFromDB(ref:string, format?:boolean) {
        return this.getInfosfromDB(ref, format, (res) => {return res.type == "action"});
    }

    getItemFromDB(ref:string, format?:boolean) {
        return this.getInfosfromDB(ref, format, (res) => {return res.type == "box"});
    }

    getInfosfromDB(ref:string, format?:boolean, fn?:(data:any)=>boolean ) {
        let temp:any;
        let ret; 

        temp = this.getDatabase().getDocument(ref);

        if (temp == null) {
            let ref2 = ref.substring(0, ref.length - 1);
            temp = this.getDatabase().getDocument(ref2);
        }

        if (temp != null) {
            if (fn) {
                if ( ! fn(temp)) {
                    return;
                }
            }
            ret = temp;
            if (format) {
                ret = [];
                for(var key in temp) {
                    if (!key.startsWith("_")) {
                        //remove internal fiedls as "_id" and "_rev"
                        ret.splice(0,0,{name: key, value:temp[key]});
                    }
                }
            }
        }

        return ret;
    }
}