import { QuerySave } from "./query-save";
import { Comment } from "./comment"

export class Query {
    
    idquery: number;
    name: string;
    createby: string;
    querysave: QuerySave;
    comments: Comment[];

    constructor(){
        this.idquery = 0;
        this.name = '';
        this.createby = '';
        this.querysave = new QuerySave();
        this.comments = [];
    }
}
