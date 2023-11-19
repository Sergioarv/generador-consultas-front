import { QuerySave } from "./query-save";
import { Comment } from "./comment"

export class Query {
    
    idquery: number;
    name: string;
    querysave: QuerySave;
    comments: Comment[];

    constructor(){
        this.idquery = 0;
        this.name = '';
        this.querysave = new QuerySave();
        this.comments = [];
    }
}
