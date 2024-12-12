import { Service } from "../abstract/Service";
import { Student } from "../interfaces/Student";
import { logger } from "../middlewares/log";
import { studentsModel } from "../orm/schemas/studentSchemas";
import { Document } from "mongoose"
import { MongoDB } from "../utils/MongoDB";
import { DBResp } from "../interfaces/DBResp";
import { resp } from "../utils/resp";

type seatInfo = {
    schoolName: string,
    department: string,
    seatNumber: string
}

export class UserService extends Service {

    public async getAllStudents(): Promise<Array<DBResp<Student>> | undefined> {
        try {
            const res: Array<DBResp<Student>> = await studentsModel.find({});
            return res;
        } catch (error) {
            return undefined;
        }

    }

    /**
     * 新增學生
     * @param info 學生資訊
     * @returns resp
     */
    public async insertOne(info: Student): Promise<resp<DBResp<Student> | undefined>> {

        const current = await this.getAllStudents()
        const resp: resp<DBResp<Student> | undefined> = {
            code: 200,
            message: "",
            body: undefined
        }

        if (current && current.length > 0) {
            try {
                const nameValidator = await this.userNameValidator(info.userName);
                if (current.length >= 200) {
                    resp.message = "student list is full";
                    resp.code = 403;
                } else {
                    if (nameValidator === "驗證通過") {
                        info.sid = String(current.length + 1);
                        info._id = undefined;
                        const res = new studentsModel(info);
                        resp.body = await res.save();
                    } else {
                        resp.code = 403;
                        resp.message = nameValidator;
                    }
                }
            } catch (error) {
                resp.message = "server error";
                resp.code = 500;
            }
        } else {
            resp.message = "server error";
            resp.code = 500;
        }

        return resp;

    }

    /**
     * 刪除一筆用戶
     * @param id:用戶_id
     * @returns resp<any>
     */

    public async deleteById(id: string) {

        const resp: resp<any> = {
            code: 200,
            message: "",
            body: undefined
        }

        try {
            const res = await studentsModel.deleteOne({ _id: id });
            resp.message = "sucess";
            resp.body = res;
        } catch (error) {
            resp.message = error as string;
            resp.code = 500;
        }
        return resp;
    }


    /**
         * 更新一筆用戶名
         * @param id uid
         * @param name 新名字
         * @returns 狀態
         */

    public async updateNameById(id: string, name: string) {

        const resp: resp<DBResp<Student> | undefined> = {
            code: 200,
            message: "",
            body: undefined
        }

        const user = await studentsModel.findById(id)
        if (user) {
            try {
                user.name = name;
                await user.save();
                resp.body = user;
                resp.message = " update sucess";
            } catch (error) {
                resp.code = 500;
                resp.message = "server error";
            }
        } else {
            resp.code = 404;
            resp.message = "user not found";
        }
        return resp;
    }


    /**
     * 學生名字驗證器
     * @param userName 學生名字
     * tku ee 0787
     * ee 科系縮寫
     *  0787 四碼
     * 座號檢查，跟之前有重複就噴錯  只能寫沒重複的號碼
     */
    public async userNameValidator(userName: string): Promise<
        '學生名字格式不正確，應為 tku + 科系縮寫 + 四碼座號，例如: tkubm1760' | '座號已存在' | '校名必須為 tku' | '座號格式不正確，必須為四位數字。' | '驗證通過'
    > {

        if (userName.length < 7) {
            return ('學生名字格式不正確，應為 tku + 科系縮寫 + 四碼座號，例如: tkubm1760');
        }

        const info = this.userNameFormator(userName);

        if (info.schoolName !== 'tku') {
            return '校名必須為 tku';
        }

        // 驗證座號(正則不想寫可以給 gpt 寫, 記得測試就好)
        const seatNumberPattern = /^\d{4}$/; // 驗證4個數字

        if (!seatNumberPattern.test(info.seatNumber)) {
            return '座號格式不正確，必須為四位數字。';
        }

        if (await this.existingSeatNumbers(info.seatNumber)) {
            return '座號已存在'
        }

        return '驗證通過'

    }

    /**
     * 用戶名格式化
     * @param userName 用戶名
     * @returns seatInfo
     */
    public userNameFormator(userName: string) {
        const info: seatInfo = {
            schoolName: userName.slice(0, 3),
            department: userName.slice(3, userName.length - 4),
            seatNumber: userName.slice(-4)
        }
        return info
    }

    /**
     * 檢查用戶名是否存在
     * @param SeatNumber 
     * @returns boolean
     */
    public async existingSeatNumbers(SeatNumber: string): Promise<boolean> {
        const students = await this.getAllStudents();
        let exist = false
        if (students) {
            students.forEach((student) => {
                const info = this.userNameFormator(student.userName)
                if (info.seatNumber === SeatNumber) {
                    exist = true;
                }
            })
        }
        return exist
    }

}