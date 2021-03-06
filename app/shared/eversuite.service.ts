import { Injectable } from "@angular/core";
import { Http, Headers, Response, URLSearchParams } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/do";
import "rxjs/add/operator/map";

import { ConfigServer } from "./configServer";

import * as dialogs from "ui/dialogs";


@Injectable()
export class EversuiteService {
    
  constructor(private http: Http) {}

  
  

  loginEversuite(config:ConfigServer, password: String) {
      let options = new Headers();
      options.append("Content-Type", "application/x-www-form-urlencoded");
  
      let urll = config.apiUrl() + "/rest/login";
      let usrcde = config.getUsercode();


      return this.http.post(
          urll,
          this.paramConvert({
            "user_name" : usrcde,
            "password" : password
          }),  
        { headers: options })
        .map(res => res)
        .catch(this.handleErrors);
    }
  
      
      
    synchEversuite(config:ConfigServer) {
      let options: Headers = this.getCommonHeaders(config.token());
//        let urll = config.apiUrl() + "\\rest\\archives\\synch\\storage\\" + config.storageKey();
      let urll = config.apiUrl() + "/rest/archives/synch/storage";
//let urll = config.apiUrl() + "/archives/synch/storage";


      return this.http.get(
          urll,  
        { headers: options })
        .map(res  => res);
    }
    

    callAPIpost(config:ConfigServer, restURL:string, parameters?:any , encode?:boolean) {
      let options: Headers = this.getCommonHeaders(config.token());
      let urll = config.apiUrl() + restURL;
      let paramString:string = encode ? this.paramConvert(parameters) : JSON.stringify(parameters);
      return this.http.post( urll, paramString, { headers: options })
                .map((res: Response) => res.json());
    }

    callAPIget(config:ConfigServer, restURL:string) {
      let options: Headers = this.getCommonHeaders(config.token());
      let urll = config.apiUrl() + restURL;
      //let paramString:string = encode ? this.paramConvert(parameters) : JSON.stringify(parameters);
      return this.http.get( urll,  { headers: options })
                .map((res: Response) => res.json());
    }

    private handleErrors(error: Response) {
      console.log(JSON.stringify(error.json()));
      return Observable.throw(error);
    }
  
    private paramConvert(obj) {
      var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
        
      for(name in obj) {
        value = obj[name];
          
        if(value instanceof Array) {
          for(i=0; i<value.length; ++i) {
            subValue = value[i];
            fullSubName = name + '[' + i + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            query += this.paramConvert(innerObj) + '&';
          }
        }
        else if(value instanceof Object) {
          for(subName in value) {
            subValue = value[subName];
            fullSubName = name + '[' + subName + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            query += this.paramConvert(innerObj) + '&';
          }
        }
        else if(value !== undefined && value !== null)
          query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
      }
        
      return query.length ? query.substr(0, query.length - 1) : query;
    };
  

    private getCommonHeaders(token: string) {
      let headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("user_token", token);
      return headers;
    }
    
} 
