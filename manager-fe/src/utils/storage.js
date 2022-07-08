/**
 * Storage二次封装
 * @author YyHhino
 */
import config from './../config'

export default {
    setItem(key,val){
        let storage = this.getStorage();
        storage[key] = val;
        window.localStorage.setItem(config.namespace,JSON.stringify(storage));
    },
    getItem(key){
        return this.getStorage()[key]
    },
    getStorage(){
        // JSON.parse() 方法用来解析 JSON 字符串，构造由字符串描述的 JavaScript 值或对象。提供可选的 reviver 函数用以在返回之前对所得到的对象执行变换 (操作)。
        return JSON.parse(window.localStorage.getItem(config.namespace) || "{}");
    },
    clearItem(key){
        // 读取
        let storage = this.getStorage();
        // 删除
        delete storage[key];
        // 写入并 覆盖
        window.localStorage.setItem(config.namespace,JSON.stringify(storage));
    },
    clearAll(){
        window.localStorage.clear()
    }
}