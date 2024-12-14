import { Route } from "../abstract/Route"
import { UserController } from "../controller/UserController";
import { logger } from "../middlewares/log";

export class UserRoute extends Route{
    
    protected url: string;
    protected Contorller = new UserController();

    constructor(){
        super()
        this.url = '/api/v1/user/'
        this.setRoutes()
    }

    protected setRoutes(): void {
        
        this.router.get(`${this.url}findAll`,(req, res)=>{
            this.Contorller.findAll(req, res);
        })

        /**
         * 新增學生
         * request body {
         *  userName: string,
         *  name: string",
         *  department: string,
         *  grade: string,
         *  class: string,
         *  Email: string
         * } 
         * @returns resp<Student>
         */

        /**
         * 新增學生
         */
        this.router.post(`${this.url}insertOne`,(req, res)=>{
            this.Contorller.insertOne(req, res);
        })

        /**
         * 刪除學生
         */
        this.router.delete(`${this.url}deleteById`,(req, res)=>{
            this.Contorller.deleteById(req, res);
        })

        /**
         * 更新學生
         */
        this.router.put(`${this.url}updateNameById`,(req, res)=>{
            this.Contorller.updateNameById(req, res);
        })
    }
}