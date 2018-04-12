interface iConfig {
  apiUrl: string; //"https://d-charentus.everteam.com:8443/es/rest/";
  userLabel: string;
  userCode: string;
  storageKey: number;
  hashPassword : string;
  token: string;
  DBIsLoaded: boolean;
}


export class ConfigServer { 

  constructor(private initData : iConfig) {}

  apiUrl(): string { return this.initData.apiUrl; }
  userLabel(): string { return this.initData.userLabel ? this.initData.userLabel : "" }
  getUsercode(): string { return this.initData.userCode; }
  hashPassword(): string { return this.initData.hashPassword; }
  token(): string { return this.initData.token; }
  storageKey(): number { return this.initData.storageKey; }

  isPaired(): boolean {
    return this.apiUrl() ? this.apiUrl().length > 0 : false;
  } 

  isLogged(): boolean {
    return this.token() ? this.token().length > 0 : false; 
  } 

  setApiUrl(urltext : string, userLabel: string, usercode: string): void {
    this.initData.apiUrl = urltext;
    this.initData.userLabel = userLabel;
    this.initData.userCode = usercode;
  } 


  userLogged(hashPassword : string, token: string): void {
    this.initData.hashPassword = hashPassword;
    this.initData.token = token;
  } 

  DBisLoaded() {
    this.initData.DBIsLoaded = true;
  }
  
  toDatas(): any {
    let ret:any = {};
    ret.apiUrl = this.initData.apiUrl;
    ret.userLabel = this.initData.userLabel;
    ret.userCode = this.initData.userCode;
    ret.storageKey = this.initData.storageKey;
    ret.hashPassword  = this.initData.hashPassword;
    ret.token = this.initData.token;
    return ret;
  }
}