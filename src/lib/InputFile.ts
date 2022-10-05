export type OnChange = (file:Blob) => Promise<void>;
export type OnError = (error:Error) => Promise<void>;
export interface InputFileOptions {
    accept:string,
    name:string,
    form?:HTMLFormElement,
    onchange: OnChange,
    onerror: OnError,
};

export class InputFile {
    private input: HTMLInputElement;
    private options:InputFileOptions;
    constructor(options:InputFileOptions) {
        this.options = options;
        this.input = this.createInput();
    }

    public createInput():HTMLInputElement {
        const input:HTMLInputElement = document.createElement('input');
        input.type = "file";
        input.style.display = "none";
        input.accept = this.options.accept;
        input.name = this.options.name;
        input.addEventListener("change",(evt:Event)=>{
            if ((<HTMLInputElement>evt.target).files) {
                const fl: FileList = <FileList>(<HTMLInputElement>evt.target).files;
                if (fl.length) {
                    this.options.onchange(<Blob>fl[0]);
                }
            }
        });     
        if ( this.options.form !== null ) {
            if (this.options.form?.querySelector(`input[name=${input.name}]`)) {
                this.options.onerror(new Error(`There is a input element which name is ${input.name} already`));
            }
            this.options.form?.append(input);
            
        }
        return input;
    }

    public open() {
        this.input.click();
    }

    public static async getBlog(url:string):Promise<Blob> {
        return new Promise<Blob>((resolve,reject)=>{
            fetch(url).then(response=>{
                response.blob().then(bdata=>resolve(bdata)).catch(err=>reject(err));
            }).catch(err=>reject(err));
        });
    };

    public static async toSrc(data:Blob):Promise<string> {
        return new Promise<string>((resolve,reject)=>{
            const reader = new FileReader();
            reader.addEventListener("load", () => {                                    
                resolve(<string>reader.result);                                    
            });
            reader.addEventListener("error",error=>{
                reject(error);
            });
            reader.readAsDataURL(data);
        });
    }
}