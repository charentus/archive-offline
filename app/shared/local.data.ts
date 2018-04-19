export class LocalDatas {
    static datas : any = {};

    public static setString(name:string, value:string) : void {
        LocalDatas.datas[name] = value;
        console.log("localdata set '"+ name + "' => " + value)
    }

    public static getString(name:string, default_value:string) : string {
        console.log("localdata get '"+ name + "' <= " + (LocalDatas.datas[name]) ? LocalDatas.datas[name] : default_value)
        return (LocalDatas.datas[name]) ? LocalDatas.datas[name] : default_value;
    }

}
