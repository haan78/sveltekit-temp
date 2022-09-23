import { SessionHandler } from './Session';
import type { RequestEvent } from './Session';

import { MongoClient, Db, Collection, ListCollectionsCursor } from 'mongodb';
type CollectionInfo = import("mongodb").CollectionInfo;

export interface MongoSessionI {
    session_id: string,
    start_time: Date,
    duration: number,
    data: any
}

export class MongoSessionHandler extends SessionHandler {

    private connectionstring: string;
    private client: MongoClient;
    private db: Db;
    private collection: Collection<MongoSessionI>| null = null;
    public static COLLECTION_NAME: string = "SK_SESSIONS";


    constructor(event: RequestEvent, connectionstring: string, dbname = "") {
        super(event);
        this.connectionstring = connectionstring;
        this.client = new MongoClient(this.connectionstring);
        this.db = this.client.db((dbname || undefined));

        //this.collection = this.client.db( (dbname || undefined ) ).collection<MongoSessionI>(MongoSessionHandler.COLLECTION_NAME);
    }



    public async getCollection():Promise<Collection<MongoSessionI>> {        
        if (this.collection === null ) {        
            const collections: ListCollectionsCursor<CollectionInfo> = this.db.listCollections<CollectionInfo>({ name: MongoSessionHandler.COLLECTION_NAME });
            const list: CollectionInfo[] = await collections.toArray();
            if (!list.length) {                
                await this.db.createCollection(MongoSessionHandler.COLLECTION_NAME);
                this.collection = this.db.collection(MongoSessionHandler.COLLECTION_NAME);
                await this.collection.createIndex({ session_id: 1 }, { unique: true });
                await this.collection.createIndex({ start_time: 1 }, { unique: false });
            } else {
                this.collection = this.db.collection(MongoSessionHandler.COLLECTION_NAME);
                const dt = new Date((new Date()).getTime() - ((MongoSessionHandler.cookieSerializeOptions.maxAge || 0) * 1000));
                this.collection.deleteMany({ start_time: { "$lte": dt } });
            }            
        }
        return this.collection;
    }

    private async finish():Promise<void> {
        if (this.collection!==null) {        
            await this.client.close();        
            this.collection = null;        
        }
    }

    protected async getById(id: string): Promise<any> {
        const coll = await this.getCollection();        
        const doc:MongoSessionI|null = (await coll.findOneAndUpdate({ session_id:id },{ $set:{ start_time:new Date() } })).value;
        await this.finish();
        return (doc === null ? null : doc.data);
    }
    
    protected async setById(id: string, data: any): Promise<void> {
        const coll = await this.getCollection();                
        await coll.updateOne({ session_id:id },{ $set:{
            session_id:id,
            data:data,
            start_time:new Date(),
            duration:MongoSessionHandler.cookieSerializeOptions.maxAge
        } },{ upsert:true });        
        await this.finish();        
    }
    protected async deleteById(id: string): Promise<void> {
        const coll = await this.getCollection();
        const result = await coll.deleteOne({session_id:id});
        await this.finish();
    }
}