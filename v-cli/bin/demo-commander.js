const { program } = require('commander');

program.version('0.0.1')

// 设置指令   program.option("-简写 --全称 <type>", "输出名称")
program.option("-n", "输出名称")
program.option("-t --type <type>", "输出名称")



const options = program.opts();

console.log("opts=>", options);


program
    // 定义我们的命令行
    .command("create <app-name>")
    // 描述
    .description("创建一个标准的Vue项目")
    // 行为 要做什么
    .action(name => {
        console.log("正在创建Vue项目，名称为：" + name);
    });

// 需要最后执行
program.parse(process.argv);
